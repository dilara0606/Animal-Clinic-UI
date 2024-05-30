function saveToken(token) {
    localStorage.setItem('token', token);
}

function getToken() {
    return localStorage.getItem('token');
}

function removeToken() {
    localStorage.removeItem('token');
}

function decodeToken(token) {
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
        throw new Error('Invalid token format');
    }

    const payload = JSON.parse(atob(tokenParts[1]));

    return payload;
}

function handleLogin(data) {
    console.log(data);

    const decodedToken = decodeToken(data.token);
    saveToken(data.token);

    const roles = decodedToken.authorities;

    if (roles.includes('DOCTOR')) {
        window.location.href = 'doctor.html'; 
    } else if (roles.includes('ADMIN')) {
        window.location.href = 'admin/admin.html'; 
    } else {
        window.location.href = 'userHomepage.html'; 
    }
}

function handleError(error) {
    console.error('Error:', error);
    removeToken();
    window.location.href = 'login.html'; 
}

var button = document.getElementById('btn');

button.onclick = function () {
    var emailInput = document.getElementById('mail');
    var passwordInput = document.getElementById('password');
    var emailError = document.getElementById('email-error');
    var passwordError = document.getElementById('password-error');
    var generalError = document.getElementById('general-error');

    var email = emailInput.value.trim();
    var password = passwordInput.value.trim();

    emailError.textContent = '';
    passwordError.textContent = '';
    generalError.textContent = '';
    emailError.style.display = 'none';
    passwordError.style.display = 'none';
    generalError.style.display = 'none';

    var hasError = false;

    if (!email) {
        emailError.textContent = 'Email cannot be empty.';
        emailError.style.display = 'block';
        hasError = true;
    }

    if (!password) {
        passwordError.textContent = 'Password cannot be empty.';
        passwordError.style.display = 'block';
        hasError = true;
    }

    if (hasError) {
        emailInput.value = '';
        passwordInput.value = '';
        return;
    }

    fetch("http://localhost:8088/api/v1/auth/authenticate", {
        mode: 'cors',
        method: "POST",
        body: JSON.stringify({ email, password }),
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Accept": "application/json"
        }
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => { throw new Error(err.error || 'Login failed'); });
        }
        return response.json();
    })
    .then(data => {
        handleLogin(data);
    })
    .catch((error) => {
        handleError(error);
    });
};

var signupLink = document.getElementById('signup');

signupLink.addEventListener('click', function(event) {
    event.preventDefault();
    window.location.href = 'register.html';
});

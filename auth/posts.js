function fetchData() {
  function getToken() {
    return localStorage.getItem("token");
  }

  const token = getToken();
  if (!token) {
    console.error("No token found");
    return;
  }

  const decodedToken = jwt_decode(token);
  console.log("Decoded Token:", decodedToken);

  const userName = decodedToken.Name;
  const userEmail = decodedToken.sub;

  const headers = new Headers();
  headers.append("Authorization", `Bearer ${token}`);

  fetch("http://localhost:8088/api/v1/user/get-following-and-followers", {
    method: "POST",
    headers: headers,
  })
    .then((response) => response.json())
    .then((data) => {
      const doctorContainer = document.querySelector(".user-container");
      doctorContainer.innerHTML = "";

      const activeDoctorInfo = document.createElement("div");
      activeDoctorInfo.classList.add("active-user-info");
      activeDoctorInfo.innerHTML = `
                <h2 class="header-title">Profile</h2>
                <div class="user-info">
                  <img src="${data.media}" alt="User media" class="user-image" />
                  <div class="user-details">
                    <p class="user-name">${data.fullName}</p>
                    <p class="user-email">${userEmail}</p>
                  </div>
                </div>
                <div class="follow-info">
                  <div class="followers">
                    <i class="fas fa-users"></i>
                    <span>${data.numberOfFollowers} Followers</span>
                  </div>
                  <div class="following">
                    <i class="fas fa-user-friends"></i>
                    <span>${data.numberOfFollowed} Following</span>
                  </div>
                </div>
            `;
      doctorContainer.appendChild(activeDoctorInfo);
    })
    .catch((error) => {
      console.log("Fetch Error:", error);
    });
}

function showSuccessMessage(message) {
  const successMessage = document.createElement("div");
  successMessage.textContent = message;
  successMessage.style.position = "fixed";
  successMessage.style.bottom = "10px";
  successMessage.style.right = "10px";
  successMessage.style.backgroundColor = "green";
  successMessage.style.color = "white";
  successMessage.style.padding = "10px";
  successMessage.style.borderRadius = "5px";
  successMessage.style.zIndex = "9999";
  document.body.appendChild(successMessage);
  setTimeout(function () {
    successMessage.remove();
  }, 10000);
}

function showErrorMessage(message) {
  const successMessage = document.createElement("div");
  successMessage.textContent = message;
  successMessage.style.position = "fixed";
  successMessage.style.bottom = "10px";
  successMessage.style.right = "10px";
  successMessage.style.backgroundColor = "red";
  successMessage.style.color = "white";
  successMessage.style.padding = "10px";
  successMessage.style.borderRadius = "5px";
  successMessage.style.zIndex = "9999";
  document.body.appendChild(successMessage);
  setTimeout(function () {
    successMessage.remove();
  }, 10000);
}

fetchData();

function getToken() {
  return localStorage.getItem("token");
}
const posts = []; 
let currentIndex = 0; 

function getPosts() {
  const token = getToken();
  if (!token) {
    console.error("No token found");
    return;
  }

  const headers = new Headers();
  headers.append("Authorization", `Bearer ${token}`);

  fetch("http://localhost:8088/api/v1/user/usersPosts", {
    method: "GET",
    headers: headers,
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Posts Data:", data);
      const postContainer = document.getElementById("post-container");
      if (Array.isArray(data) && data.length > 0) {
        posts.push(...data); // Gelen postları posts dizisine ekle
        postContainer.innerHTML = data
          .map((post, index) => {
            return `
              <div class="post" onclick="showPostDetails(${index})">
                <img src="${post.media}" alt="Post media" class="post-image" />
              </div>
            `;
          })
          .join("");
      } else {
        postContainer.innerHTML = "<p>No posts found.</p>";
      }
    })
    .catch((error) => {
      console.error("Error fetching posts:", error);
      document.getElementById("post-container").innerHTML =
        "<p>Error fetching posts. Please try again later.</p>";
    });
}

function showPostDetails(index) {
  closePostDetails();

  currentIndex = index;
  const post = posts[currentIndex];
  const overlay = document.createElement("div");
  overlay.classList.add("overlay");

  const postDetails = document.createElement("div");
  postDetails.classList.add("post-details");
  postDetails.innerHTML = `
    <div class="post-content-container">
      <div class="post-header">
        <p class="post-title">${post.title}</p>
      </div>
      <div class="post-image-container">
        <img src="${post.media}" alt="Post media" class="post-image" />
        <div class="heart-animation"></div>
      </div>
      <div class="post-actions">
        <p class="post-username">${post.userDto.name} ${post.userDto.surname}</p>
        <p class="post-content">${post.content}</p>
        <button class="like-button">❤️ ${post.numberOfLikes}</button>
        <button class="all-comment-button" data-post-id="${post.id}">💬 ${post.numberOfComment}</button>
      </div>
      <p class="post-date">${new Date(post.createdDate).toLocaleString()}</p>
    </div>
    <div class="comment-section">
      <div class="comment-list"></div>
    </div>
    <button class="close-button" onclick="closePostDetails()">Close</button>
    <div class="navigation-buttons">
      <button onclick="showPreviousPost()">Previous</button>
      <button onclick="showNextPost()">Next</button>
    </div>
  `;

  overlay.appendChild(postDetails);
  document.body.appendChild(overlay);

  document.querySelectorAll(".all-comment-button").forEach((button) => {
    button.addEventListener("click", getComments);
  });
}

function showPreviousPost() {
  if (currentIndex > 0) {
    currentIndex--;
    closePostDetails();
    showPostDetails(currentIndex);
  }
}

function showNextPost() {
  if (currentIndex < posts.length - 1) {
    currentIndex++;
    closePostDetails();
    showPostDetails(currentIndex);
  }
}

document.addEventListener("DOMContentLoaded", getPosts);

function getComments(event) {
  const postId = event.target.dataset.postId;
  const token = getToken();
  if (!token) {
    console.error("No token found");
    return;
  }

  const commentContainer = document.querySelector(".comment-list");
  commentContainer.innerHTML = ''; 

  const headers = new Headers();
  headers.append("Authorization", `Bearer ${token}`);
  headers.append("Content-Type", "application/json");

  fetch(`http://localhost:8088/api/v1/user/comments/${postId}`, {
    method: "POST",
    headers: headers,
    body: JSON.stringify({ postId: postId }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        data.forEach((comment) => {
          const commentDiv = document.createElement("div");
          commentDiv.classList.add("comment");
          commentDiv.innerHTML = `
            <div class="comment-info">
              <p class="comment-owner">${comment.commentDto.userDto.name} ${comment.commentDto.userDto.surname}</p>
              <p class="comment-content">${comment.commentDto.content}</p>
              <p class="comment-date">${new Date(comment.commentDto.date).toLocaleString()}</p>
            </div>
          `;
          commentContainer.appendChild(commentDiv);
        });
      }
    })
    .catch((error) => {
      console.error("Error fetching comments:", error);
      alert("Error fetching comments. Please try again later.");
    });
}

function closePostDetails() {
  const overlay = document.querySelector(".overlay");
  if (overlay) {
    overlay.remove();
  }
}

document.getElementById('file-input').addEventListener('change', function(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      document.getElementById('preview-img').src = e.target.result;
      document.getElementById('modal-img').src = e.target.result;
      document.getElementById('image-preview').style.display = 'block';
      document.getElementById('create-appointment-button').style.display = 'inline-block';
    }
    reader.readAsDataURL(file);
  }
});

document.getElementById('create-appointment-button').addEventListener('click', function() {
  document.getElementById('modal').style.display = 'flex';
});

document.getElementById('close-button').addEventListener('click', function() {
  document.getElementById('modal').style.display = 'none';
});

window.addEventListener('click', function(event) {
  if (event.target == document.getElementById('modal')) {
    document.getElementById('modal').style.display = 'none';
  }
});

document.getElementById('save-post').addEventListener('click', function() {
  const title = document.getElementById('title').value;
  const description = document.getElementById('description').value;
  const imageUrl = document.getElementById('modal-img').src;

  const postBody = {
    title: title,
    content: description,
    media: imageUrl,
  };

  const token = getToken();
  if (!token) {
    console.error("No token found");
    return;
  }

  const headers = new Headers();
  headers.append("Authorization", `Bearer ${token}`);
  headers.append("Content-Type", "application/json");

  fetch('http://localhost:8088/api/v1/user/create-post', {
    method: "POST",
    headers: headers,
    body: JSON.stringify(postBody),
  })
    .then(data => {
      console.log('Post created:', data);
      showSuccessMessage("Post created successfully")
    })
    .catch(error => {
      console.error('Error:', error);
      showErrorMessage("Error creating post");
    });

  document.getElementById('modal-img').src = '';
  document.getElementById('modal').style.display = 'none';
});

function uploadImage() {
  var formData = new FormData();
  var imageInput = document.getElementById('image-input').files[0];
  formData.append('image', imageInput);

  fetch('/upload-image', {
      method: 'POST',
      body: formData
  })
  .then(response => {
      if (!response.ok) {
          throw new Error('Resim yüklenirken bir hata oluştu.');
      }
      return response.json();
  })
  .then(data => {
      console.log('Resim yüklendi:', data);
  })
  .catch(error => {
      console.error('Hata:', error);
  });
}

document.getElementById('search-button').onclick = function () {
  const searchValue = document.getElementById('search-box').value;

  const userFilter = {
    name: searchValue,
    surname: searchValue
  };

  const token = getToken();
  if (!token) {
    console.error("No token found");
    return;
  }

  const headers = new Headers();
  headers.append("Authorization", `Bearer ${token}`);
  headers.append("Content-Type", "application/json");

  fetch("http://localhost:8088/api/v1/user/search", {
    method: "POST",
    headers: headers,
    body: JSON.stringify(userFilter),
  })
  .then(response => response.json())
  .then(data => {
    displaySearchResults(data);
    console.log(data);
  })
  .catch(error => {
    console.error("Error fetching search results:", error);
    alert("Error fetching search results. Please try again later.");
  });
};

function displaySearchResults(data) {
  const resultsContainer = document.getElementById('search-results');
  resultsContainer.innerHTML = ''; 

  if (Array.isArray(data) && data.length > 0) {
    data.forEach(user => {
      console.log(user);
      const userDiv = document.createElement('div');
      userDiv.classList.add('user-result');
      userDiv.innerHTML = `
        <p><a href="#" class="user-link" data-email="${user.email}"><img src="${user.media}" alt="${user.name} ${user.surname}">${user.name} ${user.surname}</a></p>
      `;
      resultsContainer.appendChild(userDiv);
    });

    resultsContainer.style.display = 'block';
  } else {
    resultsContainer.innerHTML = '<p>No matching users found.</p>';
    resultsContainer.style.display = 'block'; 
  }

  document.addEventListener('click', function(event) {
    if (event.target.classList.contains('user-link')) {
      event.preventDefault();
      const clickedUserId = event.target.getAttribute('data-email');
      fetchUserDetails(clickedUserId);
    } else if (!event.target.closest('.search-container')) {
      resultsContainer.style.display = 'none';
    }
  });
}

function fetchUserDetails(email) {
  const token = getToken();
  if (!token) {
    console.error("No token found");
    return;
  }

  const headers = new Headers();
  headers.append("Authorization", `Bearer ${token}`);

  fetch(`http://localhost:8088/api/v1/user/search/${email}`, {
    method: "GET",
    headers: headers,
  })
    .then((response) => response.json())
    .then((userData) => {
      const queryString = `?fullName=${userData.fullName}&email=${userData.email}&media=${userData.media}`;
      window.location.href = `http://127.0.0.1:5500/auth/searchUser.html${queryString}`;
    })
    .catch((error) => {
      console.log("Fetch Error:", error);
    });
}

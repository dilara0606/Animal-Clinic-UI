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

document.addEventListener("DOMContentLoaded", function () {
  const calendarEl = document.getElementById("calendar-body");
  const monthYearEl = document.getElementById("month-year");
  const prevMonthBtn = document.getElementById("prev-month");
  const nextMonthBtn = document.getElementById("next-month");

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  let currentMonth = new Date().getMonth();
  let currentYear = new Date().getFullYear();
  let approvedAppointments = [];

  function generateCalendar(month, year, appointments) {
    calendarEl.innerHTML = "";
    monthYearEl.textContent = `${monthNames[month]} ${year}`;

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();

    let calendarHTML = "<table>";
    calendarHTML +=
      "<tr><th>Sun</th><th>Mon</th><th>Tue</th><th>Wed</th><th>Thu</th><th>Fri</th><th>Sat</th></tr><tr>";

    for (let i = 0; i < firstDay; i++) {
      calendarHTML += "<td></td>";
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(
        day
      ).padStart(2, "0")}`;
      const isApproved = appointments.includes(date);
      const className = isApproved ? "approved" : "";

      if ((day + firstDay - 1) % 7 === 0) {
        calendarHTML += "</tr><tr>";
      }
      calendarHTML += `<td class="${className}">${day}</td>`;
    }

    calendarHTML += "</tr></table>";
    calendarEl.innerHTML = calendarHTML;
  }

  async function fetchAppointments() {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found");
      }

      const headers = new Headers();
      headers.append("Authorization", `Bearer ${token}`);

      const response = await fetch(
        "http://localhost:8088/api/v1/user/appointmentList",
        {
          method: "GET",
          headers: headers,
        }
      );
      if (!response.ok) {
        throw new Error("Fetch failed");
      }

      const data = await response.json();
      approvedAppointments = data
        .filter((appointment) => appointment.approvedByDoctor)
        .map((appointment) => appointment.date);

      generateCalendar(currentMonth, currentYear, approvedAppointments);
    } catch (error) {
      console.error("Fetch Error:", error);
    }
  }

  prevMonthBtn.addEventListener("click", function () {
    currentMonth--;
    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    }
    generateCalendar(currentMonth, currentYear, approvedAppointments);
  });

  nextMonthBtn.addEventListener("click", function () {
    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
    generateCalendar(currentMonth, currentYear, approvedAppointments);
  });

  fetchAppointments();
});

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
        <div class="info-container">
          <h2 class="header-title">Active User</h2>
          <p>Name: ${userName}</p>
          <p>Email: ${userEmail}</p>
          <p>Followers: ${data.numberOfFollowers}</p>
          <p>Following: ${data.numberOfFollowed}</p>
        </div>
      `;
      doctorContainer.appendChild(activeDoctorInfo);
    })
    .catch((error) => {
      console.log("Fetch Error:", error);
    });
}

fetchData();

function getAppointment() {
  function getToken() {
    return localStorage.getItem("token");
  }

  const token = getToken();
  if (!token) {
    console.error("No token found");
    return;
  }

  const headers = new Headers();
  headers.append("Authorization", `Bearer ${token}`);

  fetch("http://localhost:8088/api/v1/user/appointmentList", {
    method: "GET",
    headers: headers,
  })
    .then((response) => response.json())
    .then(async (data) => {
      console.log("Appointments Data:", data);
      const currentDate = new Date();
      const pastAppointments = [];
      const futureAppointments = [];

      data.forEach((appointment) => {
        const appointmentDate = new Date(appointment.date);
        if (appointmentDate < currentDate) {
          pastAppointments.push(appointment);
        } else {
          futureAppointments.push(appointment);
        }
      });

      displayAppointments(pastAppointments, futureAppointments);
    })
    .catch((error) => {
      console.log("Fetch Error:", error);
    });
}

function displayAppointments(pastAppointments, futureAppointments) {
  const appointmentContainer = document.getElementById("appointment-container");
  const lastAppointmentContainer = document.getElementById(
    "last-appointment-container"
  );

  lastAppointmentContainer.innerHTML = "";
  appointmentContainer.innerHTML = "";

  pastAppointments.forEach((appointment) => {
    const appointmentDiv = createAppointmentDiv(appointment, false);
    lastAppointmentContainer.appendChild(appointmentDiv);
  });

  futureAppointments.forEach((appointment) => {
    const appointmentDiv = createAppointmentDiv(appointment, true);
    appointmentContainer.appendChild(appointmentDiv);
  });

  const allAppointments = pastAppointments.concat(futureAppointments);
  const allApprovedAppointments = allAppointments
    .filter((appointment) => appointment.approvedByDoctor)
    .map((appointment) => appointment.date);

  generateCalendar(currentMonth, currentYear, allApprovedAppointments);
}

function cancelAppointment(appointmentId) {
  function getToken() {
    return localStorage.getItem("token");
  }

  const token = getToken();
  if (!token) {
    console.error("No token found");
    return;
  }

  const headers = new Headers();
  headers.append("Authorization", `Bearer ${token}`);
  headers.append("Content-Type", "application/json");

  fetch(`http://localhost:8088/api/v1/user/cancel-appointment/${appointmentId}`, {
    method: 'POST',
    headers: headers,
  })
  .then(response => {
    if (response.ok) {
      showSuccessMessage("Appointment cancelled successfully.");
      document.getElementById(`appointment-${appointmentId}`).remove();
    } else {
      showErrorMessage("Failed to cancel appointment.");
    }
  })
  .catch(error => {
    console.error("Error cancelling appointment:", error);
    showErrorMessage("Error cancelling appointment.");
  });
}

function createAppointmentDiv(appointment, isFuture) {
  const appointmentDiv = document.createElement("div");
  appointmentDiv.classList.add("appointment");
  appointmentDiv.id = `appointment-${appointment.id}`; 

  let approvedStatusColor = appointment.approvedByDoctor ? "green" : "red";
  let approvedStatus = appointment.approvedByDoctor ? "Approved" : "Not Approved";

  appointmentDiv.innerHTML = `
    <p style="color: black;">Doctor: ${appointment.doctorDto.userDto.name} ${appointment.doctorDto.userDto.surname}</p>
    <p style="color: black;">Email: ${appointment.doctorDto.userDto.email}</p>
    <p style="color: black;">Date: ${appointment.date}</p>
    <h4 style="color: ${approvedStatusColor}; margin-bottom: 20px;">Approval Status: ${approvedStatus}</h4>
  `;

  if (isFuture) {
    const cancelButton = document.createElement("button");
    cancelButton.textContent = "Cancel";
    cancelButton.classList.add("cancel-appointment-button");
    cancelButton.addEventListener("click", () => cancelAppointment(appointment.id));
    appointmentDiv.appendChild(cancelButton);
  }

  return appointmentDiv;
}

getAppointment();

function createAppointment() {
  function getToken() {
    return localStorage.getItem("token");
  }

  const token = getToken();
  if (!token) {
    console.error("No token found");
    return;
  }

  const headers = new Headers();
  headers.append("Authorization", `Bearer ${token}`);
  headers.append("Content-Type", "application/json");

  const selectedDate = document.getElementById("appointment-date").value;
  const selectedDoctor = document.getElementById("doctor-select").value;

  fetch("http://localhost:8088/api/v1/user/create-appointment", {
    method: "POST",
    headers: headers,
    body: JSON.stringify({
      date: selectedDate,
      doctor: selectedDoctor,
    }),
  })
    .then((response) => response.json())
    .then(async (data) => {
      console.log("Appointment created successfully:", data);
      getAppointment();
      showSuccessMessage("Appointment created successfully");
    })
    .catch((error) => {
      console.error("Error creating appointment:", error);
      showErrorMessage("Error creating appointment");
    });
}

document.addEventListener("DOMContentLoaded", function () {
  function getToken() {
    return localStorage.getItem("token");
  }

  const token = getToken();
  if (!token) {
    console.error("No token found");
    return;
  }

  const headers = new Headers();
  headers.append("Authorization", `Bearer ${token}`);

  fetch("http://localhost:8088/api/v1/user/getDoctors", {
    method: "GET",
    headers: headers,
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Doctors Data:", data);
      populateDoctorSelect(data);
    })
    .catch((error) => {
      console.error("Fetch Error:", error);
    });

  function populateDoctorSelect(doctorsData) {
    const doctorSelect = document.getElementById("doctor-select");

    doctorSelect.innerHTML = "";

    doctorsData.forEach((doctor) => {
      const optgroup = document.createElement("optgroup");
      optgroup.label = doctor.branchDto.name;

      const doctorOption = document.createElement("option");
      doctorOption.value = doctor.id;
      doctorOption.textContent = `${doctor.userDto.name} ${doctor.userDto.surname}`;
      optgroup.appendChild(doctorOption);

      doctorSelect.appendChild(optgroup);
    });
  }

  const createAppointmentButton = document.getElementById(
    "create-appointment-button"
  );
  createAppointmentButton.addEventListener("click", function (event) {
    event.preventDefault();
    createAppointment();
  });

  function createAppointment() {
    const selectedDoctorId = document.getElementById("doctor-select").value;
    const selectedDate = document.getElementById("appointment-date").value;

    if (!selectedDoctorId) {
      console.error("No doctor selected");
      return;
    }

    const requestBody = {
      date: selectedDate,
      doctor: {
        id: selectedDoctorId,
      },
    };

    fetch("http://localhost:8088/api/v1/user/create-appointment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(requestBody),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Appointment created successfully:", data);
      })
      .catch((error) => {
        console.error("Error creating appointment:", error);
      });
  }
});

function getToken() {
  return localStorage.getItem("token");
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
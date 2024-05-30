let controller = new ScrollMagic.Controller();
let timeline = gsap.timeline();

timeline.to(".rock", 10, { y: -300 });

let scene = new ScrollMagic.Scene({
  triggerElement: "section",
  duration: "300%",
  triggerHook: 0,
})
  .setTween(timeline)
  .addTo(controller);

let approvedAppointments = [];

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

  function generateCalendar(month, year) {
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
      const isApproved = approvedAppointments.includes(date);
      const className = isApproved ? "approved" : "";

      if ((day + firstDay - 1) % 7 === 0) {
        calendarHTML += "</tr><tr>";
      }
      calendarHTML += `<td class="${className}">${day}</td>`;
    }

    calendarHTML += "</tr></table>";
    calendarEl.innerHTML = calendarHTML;
  }

  prevMonthBtn.addEventListener("click", function () {
    currentMonth--;
    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    }
    generateCalendar(currentMonth, currentYear);
  });

  nextMonthBtn.addEventListener("click", function () {
    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
    generateCalendar(currentMonth, currentYear);
  });

  generateCalendar(currentMonth, currentYear);
  fetchData();
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

  const doctorName = decodedToken.Name;
  const doctorEmail = decodedToken.sub;

  const doctorContainer = document.querySelector(".doctor-container");
  doctorContainer.innerHTML = "";

  const activeDoctorInfo = document.createElement("div");
  activeDoctorInfo.classList.add("active-doctor-info");
  activeDoctorInfo.innerHTML = `
            <h2 class="header-title">Active Doctor</h2>
            <p>Name: ${doctorName}</p>
            <p>Email: ${doctorEmail}</p>
        `;
  doctorContainer.appendChild(activeDoctorInfo);

  const appointmentContainer = document.querySelector(".appointment-container");
  const headers = new Headers();
  headers.append("Authorization", `Bearer ${token}`);

  fetch("http://localhost:8088/api/v1/doctor/appointments", {
    method: "GET",
    headers: headers,
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Appointments Data:", data);
      appointmentContainer.innerHTML = "";

      const currentDate = new Date();

      const filteredAppointments = data.filter((appointment) => {
        const appointmentDate = new Date(appointment.date);
        return appointmentDate > currentDate;
      });

      approvedAppointments = filteredAppointments
        .filter((appointment) => appointment.approvedByDoctor)
        .map((appointment) => appointment.date);

      console.log("Approved Appointments:", approvedAppointments);

      for (let i = 0; i < filteredAppointments.length; i += 3) {
        const appointmentGroup = document.createElement("div");
        appointmentGroup.classList.add("appointment-group");

        for (let j = i; j < i + 3 && j < filteredAppointments.length; j++) {
          const appointment = filteredAppointments[j];

          const appointmentElement = document.createElement("div");
          appointmentElement.classList.add("appointment");

          const appointmentOwner = document.createElement("p");
          appointmentOwner.classList.add("appointment-owner");
          appointmentOwner.textContent = `Owner: ${appointment.userDto.fullName}`;

          const appointmentEmail = document.createElement("p");
          appointmentEmail.classList.add("appointment-email");
          appointmentEmail.textContent = `Email: ${appointment.userDto.email}`;

          const appointmentDate = document.createElement("p");
          appointmentDate.classList.add("appointment-date");
          appointmentDate.textContent = `Date: ${appointment.date}`;

          const approvedByDoctor = document.createElement("p");
          approvedByDoctor.classList.add("approved-by-doctor");

          if (appointment.approvedByDoctor) {
            approvedByDoctor.style.color = "green";
            approvedByDoctor.textContent = "Approved";
          } else {
            approvedByDoctor.style.color = "red";
            approvedByDoctor.textContent = "Not Approved Yet";

            const rejectButton = document.createElement("button");
            rejectButton.classList.add("reject-button");
            rejectButton.textContent = "Reject";
            rejectButton.addEventListener("click", function () {
              rejectAppointment(
                appointment.id,
                token,
                rejectButton,
                acceptButton
              );
            });
            appointmentElement.appendChild(rejectButton);

            const acceptButton = document.createElement("button");
            acceptButton.classList.add("accept-button");
            acceptButton.textContent = "Accept";
            acceptButton.addEventListener("click", function () {
              acceptAppointment(appointment.id, token);
            });
            appointmentElement.appendChild(acceptButton);
          }

          appointmentElement.appendChild(appointmentOwner);
          appointmentElement.appendChild(appointmentEmail);
          appointmentElement.appendChild(appointmentDate);
          appointmentElement.appendChild(approvedByDoctor);

          appointmentGroup.appendChild(appointmentElement);
        }

        appointmentContainer.appendChild(appointmentGroup);
      }

      const lastApprovedAppointment = data
        .filter((appointment) => {
          const appointmentDate = new Date(appointment.date);
          return appointment.approvedByDoctor && appointmentDate < currentDate;
        })
        .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

      if (lastApprovedAppointment) {
        const lastAppointmentInfo = document.getElementById(
          "last-appointment-info"
        );
        lastAppointmentInfo.innerHTML = `
              <p style="color: black;">Owner: ${lastApprovedAppointment.userDto.fullName}</p>
              <p style="color: black;">Email: ${lastApprovedAppointment.userDto.email}</p>
              <p style="color: black;">Date: ${lastApprovedAppointment.date}</p>
          `;
      }

      generateCalendar(currentMonth, currentYear);
    })
    .catch((error) => {
      console.log("Fetch Error:", error);
    });
}

function rejectAppointment(appointmentId, token, rejectButton, acceptButton) {
  fetch(
    `http://localhost:8088/api/v1/doctor/appointments/${appointmentId}/reject`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.text();
    })
    .then((data) => {
      console.log("Appointment rejected:", data);
      rejectButton.style.display = "none";
      acceptButton.style.display = "none";
      rejectButton.previousSibling.textContent = "Rejected";
      rejectButton.previousSibling.style.color = "red";
      showErrorMessage("Appointment rejected."); 
      fetchData();
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function showErrorMessage(message) {
  const errorMessage = document.createElement('div');
  errorMessage.textContent = message;
  errorMessage.style.position = "fixed";
  errorMessage.style.bottom = "10px";
  errorMessage.style.left = "10px";
  errorMessage.style.backgroundColor = "red";
  errorMessage.style.color = "white";
  errorMessage.style.padding = "10px";
  errorMessage.style.borderRadius = "5px";
  errorMessage.style.zIndex = "9999";
  document.body.appendChild(errorMessage);
  setTimeout(function() {
    errorMessage.remove(); 
  }, 10000);
}

function acceptAppointment(appointmentId, token) {
  fetch(
    `http://localhost:8088/api/v1/doctor/appointments/${appointmentId}/confirm`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.text();
    })
    .then((data) => {
      console.log("Appointment accepted:", data);
      showSuccessMessage("Appointment accepted successfully.");
      fetchData();
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function showSuccessMessage(message) {
  const successMessage = document.createElement("div");
  successMessage.textContent = message;
  successMessage.style.position = "fixed";
  successMessage.style.bottom = "10px";
  successMessage.style.left = "10px";
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

fetchData();

document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);
  const title = urlParams.get("title");
  const content = urlParams.get("content");

  document.getElementById("titleInput").value = decodeURIComponent(title);
  document.getElementById("contentInput").value = decodeURIComponent(content);
});

document.addEventListener("DOMContentLoaded", function () {
  const saveButton = document.getElementById("saveButton");

  saveButton.addEventListener("click", function () {
    const title = document.getElementById("titleInput").value;
    const content = document.getElementById("contentInput").value;
    const date = new Date().toISOString();
    const media = "";

    function getToken() {
      return localStorage.getItem("token");
    }

    const token = getToken();
    if (!token) {
      console.error("No token found");
      return;
    }

    const requestBody = JSON.stringify({
      title: title,
      content: content,
      date: date,
      media: media,
    });

    fetch("http://localhost:8088/api/v1/homepage/create-news", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: requestBody,
    })
      .then((response) => {
        if (response.ok) {
          console.log("News created successfully.");
          showSuccessMessage();
        } else {
          console.error("Failed to create news.");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  });

  function showSuccessMessage() {
    const successMessage = document.createElement("div");
    successMessage.textContent = "News created successfully.";
    successMessage.style.position = "fixed";
    successMessage.style.bottom = "10px";
    successMessage.style.left = "10px";
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
});

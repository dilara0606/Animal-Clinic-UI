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

function generateCalendar(month, year) {
    const calendarEl = document.getElementById("calendar-body");
    const monthYearEl = document.getElementById("month-year");

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    calendarEl.innerHTML = "";
    monthYearEl.textContent = `${monthNames[month]} ${year}`;

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();

    let calendarHTML = "<table>";
    calendarHTML += "<tr><th>Sun</th><th>Mon</th><th>Tue</th><th>Wed</th><th>Thu</th><th>Fri</th><th>Sat</th></tr><tr>";

    for (let i = 0; i < firstDay; i++) {
        calendarHTML += "<td></td>";
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        const isApproved = approvedAppointments.includes(date);
        const className = isApproved ? "approved" : "";

        if ((day + firstDay - 1) % 7 === 0) {
            calendarHTML += "</tr><tr>";
        }
        calendarHTML += `<td class="${className}">${day}</td>`;
    }

    calendarHTML += "</tr></table>";
    calendarEl.innerHTML = calendarHTML;

    const cells = document.querySelectorAll("#calendar-body td");
    cells.forEach((cell) => {
        const date = cell.textContent;
        if (approvedAppointments.includes(`${year}-${String(month + 1).padStart(2, "0")}-${String(date).padStart(2, "0")}`)) {
            cell.classList.add("approved-date");
        }
    });
}

let currentMonth;
let currentYear;

document.addEventListener("DOMContentLoaded", function () {
    const prevMonthBtn = document.getElementById("prev-month");
    const nextMonthBtn = document.getElementById("next-month");

    currentMonth = new Date().getMonth();
    currentYear = new Date().getFullYear();

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
  
    const headers = new Headers();
    headers.append("Authorization", `Bearer ${token}`);
  
    fetch("http://localhost:8088/api/v1/doctor/appointments", {
      method: "GET",
      headers: headers,
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Appointments Data:", data);

        data.forEach((appointment) => {
            if (appointment.approvedByDoctor) {
                approvedAppointments.push(appointment.date);
            }
        });
    
        console.log("Approved Appointments:", approvedAppointments);
  
        const currentDate = new Date();
  
        const filteredAppointments = data.filter((appointment) => {
          const appointmentDate = new Date(appointment.date);
          return appointmentDate < currentDate;
        });
  
        console.log("Filtered Appointments:", filteredAppointments);
  
        const approvedAppointmentsContainer = document.getElementById("approved-appointment-container");
        const notApprovedAppointmentsContainer = document.getElementById("not-approved-appointment-container");
  
        approvedAppointmentsContainer.innerHTML = "";
        notApprovedAppointmentsContainer.innerHTML = "";
  
        filteredAppointments.forEach((appointment) => {
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
            approvedAppointmentsContainer.appendChild(appointmentElement);
          } else {
            approvedByDoctor.style.color = "red";
            approvedByDoctor.textContent = "Not Approved";
            notApprovedAppointmentsContainer.appendChild(appointmentElement);
          }
  
          appointmentElement.appendChild(appointmentOwner);
          appointmentElement.appendChild(appointmentEmail);
          appointmentElement.appendChild(appointmentDate);
          appointmentElement.appendChild(approvedByDoctor);
        });

        generateCalendar(currentMonth, currentYear);
      })
      .catch(error => {
        console.error("Error fetching appointments:", error);
      });
}

fetchData();

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

  async function fetchData() {
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
      const currentDate = new Date();

      approvedAppointments = data
        .filter((appointment) => {
          const appointmentDate = new Date(appointment.date);
          return appointmentDate > currentDate && appointment.approvedByDoctor;
        })
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
      const currentDate = new Date();
      console.log("Data", data);

      const lastAppointment = data
        .filter((appointment) => new Date(appointment.date) > currentDate)
        .sort((a, b) => new Date(a.date) - new Date(b.date))[0];

      if (lastAppointment) {
        const approvedStatus = lastAppointment.approvedByDoctor ? "Approved" : "Not Approved";
        const lastAppointmentInfo = document.getElementById("last-appointment-info");
        lastAppointmentInfo.innerHTML = `
          <p><i class="fas fa-user-md"></i> Doctor: ${lastAppointment.doctorDto.userDto.name} ${lastAppointment.doctorDto.userDto.surname}</p>
          <p><i class="fas fa-envelope"></i> Email: ${lastAppointment.doctorDto.userDto.email}</p>
          <p><i class="fas fa-calendar-alt"></i> Date: ${new Date(lastAppointment.date).toLocaleString()}</p>
          <h4 style="color:green;"><i class="fas fa-check-circle"></i> Approval Status: ${approvedStatus}</h4>
        `;
      }
    })
    .catch((error) => {
      console.log("Fetch Error:", error);
    });
}

getAppointment();

function getToken() {
  return localStorage.getItem("token");
}

function getPosts() {
  const token = getToken();
  if (!token) {
    console.error("No token found");
    return;
  }

  const headers = new Headers();
  headers.append("Authorization", `Bearer ${token}`);

  fetch("http://localhost:8088/api/v1/user/posts", {
    method: "GET",
    headers: headers,
  })
    .then((response) => response.json())
    .then((data) => {
      const postContainer = document.getElementById("post-container");
      if (Array.isArray(data) && data.length > 0) {
        postContainer.innerHTML = data
          .map((post) => {
            return `
              <div class="post">
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
                  <button class="like-button" data-post-id="${post.id}">❤️ ${post.numberOfLikes}</button>
                  <button class="all-comment-button" data-post-id="${post.id}">💬 ${post.numberOfComment}</button>
                </div>
                <p class="post-date">${new Date(post.createdDate).toLocaleString()}</p>
                <div class="comment-section">
                  <textarea class="comment-input" id="comment-input" placeholder="Add a comment..."></textarea>
                  <button class="comment-button" data-post-id="${post.id}">Post</button>
                </div>
              </div>
            `;
          })
          .join("");

        document.querySelectorAll(".like-button").forEach((button) => {
          button.addEventListener("click", likePost);
        });

        document.querySelectorAll(".comment-button").forEach((button) => {
          button.addEventListener("click", addComment);
        });

        document.querySelectorAll(".all-comment-button").forEach((button) => {
          button.addEventListener("click", getComments);
        });
      } else {
        postContainer.innerHTML = "<p>No posts found.</p>";
      }
    })
    .catch((error) => {
      console.error("Error fetching posts:", error);
      document.getElementById("post-container").innerHTML = "<p>Error fetching posts. Please try again later.</p>";
    });
}

getPosts();

function likePost(event) {
  const postId = event.target.dataset.postId;
  console.log(postId);
  const token = getToken();
  if (!token) {
    console.error("No token found");
    return;
  }

  const headers = new Headers();
  headers.append("Authorization", `Bearer ${token}`);
  headers.append("Content-Type", "application/json");

  fetch(`http://localhost:8088/api/v1/user/like/${postId}`, {
    method: "POST",
    headers: headers,
    body: JSON.stringify({ postId: postId }),
  })
    .then((response) => {
      if (response.ok) {
        console.log("Post liked successfully");
        createFallingHearts();
        showSuccessMessage("Post liked❤️")
        getPosts();
      }
    })
    .catch((error) => {
      console.error("Error liking post:", error);
    });
}

function createFallingHearts() {
  const heartContainer = document.createElement("div");
  heartContainer.classList.add("heart-container");
  document.body.appendChild(heartContainer);

  for (let i = 0; i < 20; i++) {
    const heart = document.createElement("div");
    heart.classList.add("falling-heart");
    heart.style.left = `${Math.random() * 100}%`;
    heart.style.animationDelay = `${Math.random() * 2}s`;
    heartContainer.appendChild(heart);
  }

  setTimeout(() => {
    heartContainer.remove();
  }, 5000);
}

function getComments(event) {
  const postId = event.target.dataset.postId;
  const token = getToken();
  if (!token) {
    console.error("No token found");
    return;
  }

  const postElement = event.target.closest(".post");
  let commentContainer = postElement.querySelector(".comment-list");

  if (commentContainer) {
    if (commentContainer.style.display === "block") {
      commentContainer.style.display = "none";
    } else {
      commentContainer.style.display = "block";
    }
    return;
  } else {
    commentContainer = document.createElement("div");
    commentContainer.classList.add("comment-list");
    postElement.querySelector(".comment-section").appendChild(commentContainer);
  }

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
        console.log(comment);
        const commentDiv = document.createElement("div");
        commentDiv.classList.add("comment");
        commentDiv.innerHTML = `
          <div class="comment-info">
            <p class="comment-owner">${comment.commentDto.userDto.name} ${comment.commentDto.userDto.surname}</p>
            <p class="comment-content">${comment.commentDto.content}</p>
            <button class="reply-button" comment-id="${comment.commentDto.id}"><i class="fas fa-reply"></i></button>
            <p class="comment-date">${comment.commentDto.date}</p>
          </div>
        `;

        if (comment.commentDto.replyCommentList && comment.commentDto.replyCommentList.length > 0) {
          const repliesContainer = document.createElement("div");
          repliesContainer.classList.add("replies-container");

          comment.commentDto.replyCommentList.forEach((reply) => {

            const replyDiv = document.createElement("div");
            replyDiv.classList.add("comment-reply");
            replyDiv.innerHTML = `
              <div class="comment-info">
                <p class="comment-owner">${reply.user.name} ${reply.user.surname}</p>
                <p class="comment-content">${reply.content}</p>
                <p class="comment-date">${reply.date}</p>
              </div>
            `;
            repliesContainer.appendChild(replyDiv);
          });
          commentDiv.appendChild(repliesContainer);
        }
        commentContainer.appendChild(commentDiv);
      commentDiv.querySelector(".reply-button").addEventListener("click", addReply);
      });
    }
  })
  .catch((error) => {
    console.error("Error fetching comments:", error);
    commentContainer.innerHTML = "<p>Error fetching comments. Please try again later.</p>";
  });
}

function addReply(event) {
  const commentId = event.currentTarget.getAttribute("comment-id");

  const commentInput = event.currentTarget.closest(".post").querySelector(".comment-input");
  if (!commentInput) {
    console.error("Comment input not found.");
    return;
  }
  
  const commentValue = commentInput.value;
  console.log(commentValue);
  if (!commentValue.trim()) {
    showErrorMessage("Comment cannot be empty");
    return;
  }

  const token = getToken();
  if (!token) {
    console.error("No token found");
    return;
  }

  const headers = new Headers();
  headers.append("Authorization", `Bearer ${token}`);
  headers.append("Content-Type", "application/json");

  fetch(`http://localhost:8088/api/v1/user/add-replyComment/${commentId}`, {
    method: "POST",
    headers: headers,
    body: JSON.stringify({
      content: commentValue,
    })
  })
  .then(response => {
    if (!response.ok) {
      throw new Error("Failed to add reply.");
    }
    showSuccessMessage("Reply comment added successfully");
    getComments();
  })
  .catch(error => {
    console.error("Error adding reply:", error);
  });
}

document.querySelectorAll(".comment-button").forEach((button) => {
  button.addEventListener("click", addComment);
});

document.querySelectorAll(".all-comment-button").forEach((button) => {
  button.addEventListener("click", getComments);
});


function addComment(event) {
  const postId = event.target.dataset.postId;
  const commentInput =
    event.target.parentElement.querySelector(".comment-input").value;
  const token = getToken();

  if (!commentInput.trim()) {
    showErrorMessage("Comment cannot be empty");
    console.error("Comment cannot be empty");
    return;
  }

  if (!token) {
    console.error("No token found");
    return;
  }

  const headers = new Headers();
  headers.append("Authorization", `Bearer ${token}`);
  headers.append("Content-Type", "application/json");

  fetch(`http://localhost:8088/api/v1/user/add-comment/${postId}`, {
    method: "POST",
    headers: headers,
    body: JSON.stringify({
      content: commentInput,
    }),
  })
    .then((response) => {
      if (response.ok) {
        console.log("Comment added successfully");
        showSuccessMessage("Comment added successfully");
        getPosts();
      } else {
        console.error("Error adding comment:", response.statusText);
      }
    })
    .catch((error) => {
      console.error("Error adding comment:", error);
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
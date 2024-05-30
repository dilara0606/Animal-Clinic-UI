document.addEventListener("DOMContentLoaded", function () {
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

    fetch("http://localhost:8088/api/v1/homepage/doctorsNews", {
      method: "GET",
      headers: headers,
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("API Response Data:", data); // Log the entire response data

        const newsInfo = document.getElementById("news-info");
        newsInfo.innerHTML = ""; // Clear previous news

        data.forEach((postData) => {
          console.log(`Creating news item with ID: ${postData.id}`); // Debugging line

          if (!postData.id) {
            console.error("News item missing ID:", postData); // Log the entire news item if ID is missing
          }

          const newsItem = document.createElement("div");
          newsItem.classList.add("news-item");
          newsItem.innerHTML = `
                    <input type="checkbox" class="news-checkbox" data-id="${postData.id}">
                    <h3>${postData.title}</h3>
                    <p>${postData.content}</p>
                    <p>${postData.date}</p>
                `;
          newsInfo.appendChild(newsItem);
        });

        // Add event listeners after news items are added to the DOM
        const editButton = document.querySelector(".edit-button");
        const deleteButton = document.querySelector(".delete-button");

        if (editButton && deleteButton) {
          editButton.addEventListener("click", editNews);
          deleteButton.addEventListener("click", deleteNews);
        }
      })
      .catch((error) => {
        console.error("Fetch Error:", error);
        if (
          error instanceof TypeError &&
          error.message.includes("Cannot read properties of undefined")
        ) {
          console.error("There was an issue with the response data.");
        } else {
          console.error(
            "An unexpected error occurred. Please try again later."
          );
        }
      });
  }

  fetchData();

  function editNews() {
    const selectedNews = getSelectedNews();
    if (selectedNews.length !== 1) {
      alert("Please select exactly one news item to edit.");
      return;
    }

    const newsId = selectedNews[0];
    console.log("Editing news with ID:", newsId);

    const selectedNewsItem = document.querySelector(
      `.news-item input[data-id="${newsId}"]`
    );
    const title = selectedNewsItem.nextElementSibling.textContent;
    const content =
      selectedNewsItem.nextElementSibling.nextElementSibling.textContent;

    window.location.href = `addNew.html?title=${encodeURIComponent(
      title
    )}&content=${encodeURIComponent(content)}`;
  }

  function deleteNews() {
    const selectedNews = getSelectedNews();
    if (selectedNews.length === 0) {
      alert("Please select at least one news item to delete.");
      return;
    }
  
    console.log("Selected news IDs for deletion:", selectedNews);
  
    const token = localStorage.getItem("token");
    const headers = new Headers();
    headers.append("Authorization", `Bearer ${token}`);
    headers.append("Content-Type", "application/json");
  
    selectedNews.forEach((newsId) => {
      if (!newsId) {
        console.error(
          "Undefined news ID detected, skipping deletion for this item."
        );
        return;
      }
  
      fetch(`http://localhost:8088/api/v1/homepage/news/${newsId}/delete`, {
        method: "POST",
        headers: headers,
      })
        .then((response) => {
          if (response.ok) {
            console.log(`News with ID ${newsId} deleted successfully.`);
            document
              .querySelector(`input[data-id="${newsId}"]`)
              .closest(".news-item")
              .remove();
            showSuccessMessage("News deleted successfully."); 
          } else {
            console.error(`Failed to delete news with ID ${newsId}.`);
          }
        })
        .catch((error) => {
          console.error("Error:", error);
        });
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
  

  function getSelectedNews() {
    const checkboxes = document.querySelectorAll(".news-checkbox:checked");
    const selectedNews = Array.from(checkboxes).map((checkbox) => {
      const newsId = checkbox.getAttribute("data-id");
      console.log("Selected checkbox ID:", newsId);
      return newsId;
    });
    console.log("Selected news checkboxes:", selectedNews);
    return selectedNews.filter((id) => id !== undefined);
  }
});

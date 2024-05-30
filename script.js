let controller = new ScrollMagic.Controller();
let timeline = gsap.timeline();

timeline
  .to(".rock", 10, { y: -300 })
  .fromTo(".bg1", { y: -50 }, { y: 0, duration: 10 }, "-=10")
  .to(".content", 10, { top: "0%" }, "-=5")
  .fromTo(".content-images", { opacity: 0 }, { opacity: 1, duration: 3 })
  .fromTo(
    ".nav-title",
    { opacity: 0, y: -20 },
    { opacity: 1, y: 0, duration: 1 },
    "-=10"
  )
  .fromTo(
    ".header",
    { opacity: 0, y: -20 },
    { opacity: 1, y: 0, duration: 1 },
    "-=10"
  )
  .fromTo(
    ".nav-link",
    { opacity: 0, y: -20 },
    { opacity: 1, y: 0, duration: 1 },
    "-=10"
  )
  .fromTo(".baloncuklar2", { opacity: 0 }, { opacity: 1, duration: 2 })
  .fromTo(
    ".content-data",
    { opacity: 0, y: -20 },
    { opacity: 1, y: 0, duration: 3 },
    "-=8"
  );

let scene = new ScrollMagic.Scene({
  triggerElement: "section",
  duration: "300%",
  triggerHook: 0,
})
  .setTween(timeline)
  .setPin("section")
  .addTo(controller);

  document.addEventListener('DOMContentLoaded', function() {
    const prevButton = document.getElementById('prevButton');
    const nextButton = document.getElementById('nextButton');
  
    let currentIndex = 0;
    let data = [];
  
    function fetchData() {
      fetch("http://localhost:8088/api/v1/homepage/allNews")
        .then((response) => response.json())
        .then((responseData) => {
          data = responseData; 
          displayNews(currentIndex); 
          setInterval(showNextNews, 15000); 
        })
        .catch((error) => {
          console.error("Fetch Error:", error);
        });
    }
  
    function displayNews(index) {
      const postData = data[index];
      const contentTitle = document.getElementById("content-title");
      const contentText = document.getElementById("content-text");
      const contentDate = document.getElementById("content-date");
      const contentOwner = document.getElementById("content-owner");
  
      contentTitle.innerHTML = postData.title;
      contentText.innerHTML = postData.content;
      contentDate.innerHTML = postData.date;
      contentOwner.innerHTML = postData.doctor.doctorName;
    }

    function showNextNews() {
      currentIndex = (currentIndex + 1) % data.length;
      displayNews(currentIndex);
    }

    function showPrevNews() {
      currentIndex = (currentIndex - 1 + data.length) % data.length;
      displayNews(currentIndex);
    }
  
    prevButton.addEventListener('click', showPrevNews);
    nextButton.addEventListener('click', showNextNews);
  
    fetchData();
  });

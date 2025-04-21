var lastTab = '';
var isInProjectWindow = false;
var highlightedProjectIndex = 1000;

const tabsEnum = {
  home: "home",
  projects: "projects",
  about: "about"
}

var tabs = [];
var mainContent;
var pageTitle;

function updateMainContent(data) {
  cleanupResources();
  scrollToTheTop();
  mainContent.innerHTML = data;
  startObsevingVideos();
}

function loadTab(tabName) {
  if (tabName === lastTab && !isInProjectWindow) {
    scrollToTheTop();
    closeFilterDropdown();
    return;
  } else {
    lastTab = tabName;
  }

  const path = `tabs/${tabName}.html`;

  fetch(path)
    .then(response => response.text())
    .then(data => {
      isInProjectWindow = false;
      pageTitle.innerHTML = "";
      pageTitle.classList.remove('active');
      updateMainContent(data);
      perTabLoad(tabName);
      tabs.forEach(t => t.classList.remove("active"));
      document.getElementById(tabName).classList.add("active");
    })
    .catch(err => {
      console.error("Error loading the content: ", err);
      mainContent.innerHTML = "<p>Error loading content</p>";
    });
}

function loadPage(pageURL, title) {
  fetch(pageURL)
    .then(response => response.text())
    .then(data => {
      isInProjectWindow = true;
      if(title) {pageTitle.innerHTML = title; pageTitle.classList.add('active')}
      updateMainContent(data);
    })
    .catch(error => {
      console.error("Error loading project:", error);
      mainContent.innerHTML = `<p>Error loading project. Please try again.</p>`;
    });
}

function perTabLoad(tabName) {
  switch (tabName) {
    case tabsEnum.home:
      getHightlightedProjects();
      break;
    case tabsEnum.projects:
      loadProjects('card-container', 'assets/page-data-files/projects-data.json');
      break;
    default:
      break;
  }
}
function loadEmbeddedProject(startButton, container, embeddedProjectHTML, loadingScreen) {
  const embeddedProjectContent = document.getElementById(container);
  const loadingScreenElement = document.getElementById(loadingScreen);

  if(startButton.innerHTML == 'Start') {
    loadingScreenElement.style.visibility = 'visible';
    fetch(embeddedProjectHTML)
    .then(response => response.text())
    .then(data => {
      startButton.innerHTML = "Stop"
      embeddedProjectContent.innerHTML = data;
    })
    .catch(error => {
      loadingScreenElement.style.visibility = 'hidden';
      console.error("Error loading embedded project:", error);
      embeddedProjectContent.innerHTML = `<p>Error loading project. Please try again.</p>`;
    });
  } else {
    loadingScreenElement.style.visibility = 'hidden';
    startButton.innerHTML = "Start"
    embeddedProjectContent.innerHTML = "";
  }
}

function restartEmbeddedProject(startButton, container, embeddedProjectHTML, loadingScreen) {
  const embeddedProjectContent = document.getElementById(container);
  const startButtonElement = document.getElementById(startButton);
  const loadingScreenElement = document.getElementById(loadingScreen);

  if(startButtonElement.innerHTML == 'Stop') {
    loadingScreenElement.style.visibility = 'visible';
    fetch(embeddedProjectHTML)
    .then(response => response.text())
    .then(data => {
      embeddedProjectContent.innerHTML = data;
    })
    .catch(error => {
      loadingScreenElement.style.visibility = 'hidden';
      console.error("Error loading embedded project:", error);
      embeddedProjectContent.innerHTML = `<p>Error loading project. Please try again.</p>`;
    });
  }
}

function scrollToTheTop() {
  window.scrollTo(0, 0);
}

function cleanupResources() {
  while (mainContent.firstChild) {
    mainContent.removeChild(mainContent.firstChild);
  }
  stopObservingVideos();
  highlightedProjectIndex = 1000;
}

async function getHightlightedProjects() {
  try {
    const highlightTrack = document.querySelector('.highlights-track');

    highlightTrack.innerHTML = "";

    const [jsonResponse, templateResponse] = await Promise.all([
      fetch('assets/page-data-files/highlighted-projects-data.json'),
      fetch('assets/templates/project-card.html')
    ]);
  
    const projects = await jsonResponse.json();
    const templateText = await templateResponse.text();
    const parser = new DOMParser();
    const templateDoc = parser.parseFromString(templateText, 'text/html');
    const template = templateDoc.getElementById('project-card').innerHTML;
  
    for(var i = 0; i < 3; i++) {
      var html = replacePlaceholders(template, projects[(highlightedProjectIndex + i) % projects.length]);
      highlightTrack.insertAdjacentHTML('beforeend', html);
    }
  } catch (error) {
    console.error("Error loading highlighted projects:", error);
  }
}

function scrollHighlights(direction) {
  if(direction) {
    highlightedProjectIndex++;
  } else {
    highlightedProjectIndex--;
    if(highlightedProjectIndex < 0) highlightedProjectIndex = 1000;
  }

  getHightlightedProjects();
}
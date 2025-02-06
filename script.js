var lastTab = '';
var isInProjectWindow = false;

const tabsEnum = {
  home: "home",
  gameDev: "game-dev",
  projects: "projects",
  contacts: "contacts"
}

var tabs = [];
var mainContent;
var pageTitle;

function updateMainContent(data) {
  mainContent.innerHTML = data;
}

function loadTab(tabName) {
  if (tabName === lastTab && !isInProjectWindow) {
    scrollToTheTop();
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
    case "projects":
      loadProjects('card-container', 'assets/page-data-files/projects-data.json');
    default:
      return;
  }
}

function scrollToTheTop() {
  window.scrollTo(0, 0);
}
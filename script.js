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
var filterHeader;

function updateMainContent(data) {
  mainContent.innerHTML = data;
}

function loadTab(tabName) {
  if (tabName === lastTab && !isInProjectWindow) return;
  else lastTab = tabName;

  const path = `tabs/${tabName}.html`;

  fetch(path)
    .then(response => response.text())
    .then(data => {
      isInProjectWindow = false;
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

function loadProject(projectURL) {
  fetch(projectURL)
    .then(response => response.text())
    .then(data => {
      isInProjectWindow = true;
      toggleFilterHeaderVisibility(false);
      updateMainContent(data);
    })
    .catch(error => {
      console.error("Error loading project:", error);
      mainContent.innerHTML = `<p>Error loading project. Please try again.</p>`;
    });
}

function perTabLoad(tabName) {
  switch (tabName) {
    case tabsEnum.projects:
      toggleFilterHeaderVisibility(true);
      addProjects('card-container', 'assets/page-data-files/projects-data.json');
      return;
    default:
      toggleFilterHeaderVisibility(false);
      filterHeader.classList.remove('expanded');
      return;
  }
}

function toggleFilterHeaderVisibility(value) {
  if(value) {filterHeader.classList.add('on');}
  else {filterHeader.classList.remove('on');}
}

function toggleFilterHeader() {
  filterHeader.classList.toggle('expanded');
}
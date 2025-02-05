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

function updateMainContent(data) {
  mainContent.innerHTML = data;
}

function loadTab(tabName) {
  if (tabName === lastTab && !isInProjectWindow) {
    window.scrollTo(0, 0);
    return;
  } else {
    lastTab = tabName;
  }

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

function toggleFilterDropdown() {
  const filterDropdown = document.getElementById('filter-dropdown');
  filterDropdown.classList.toggle('active');
}

function filterProjectsByYear() {
  const yearFilter = document.getElementById('year-filter').value;
  renderProjects('card-container', yearFilter);
}
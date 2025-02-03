var lastTab = '';
var isInProjectWindow = false;

var tabs = [];
var mainContent;

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
      updateMainContent(data);
    })
    .catch(error => {
      console.error("Error loading project:", error);
      mainContent.innerHTML = `<p>Error loading project. Please try again.</p>`;
    });
}

function perTabLoad(tabName) {
  switch (tabName) {
    case "other-projects":
      addProjects('card-container', 'assets/page-data-files/other-projects-data.json');
    default:
      return;
  }
}
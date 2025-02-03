var lastTab = '';
var isInProjectWindow = false;

var tabs = [];
var mainContent;

function loadTab(tabName) {
  if (tabName === lastTab && !isInProjectWindow) return;
  else lastTab = tabName;

  const path = `tabs/${tabName}.html`;
  const mainContent = document.getElementById("main-content");

  fetch(path)
    .then(response => response.text())
    .then(data => {
      isInProjectWindow = false;
      mainContent.innerHTML = data;
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
      mainContent.innerHTML = data;
    })
    .catch(error => {
      console.error("Error loading project:", error);
      mainContent.innerHTML = `<p>Error loading project. Please try again.</p>`;
    });
}
var lastTab = '';
var isInProjectWindow = false;

document.addEventListener("DOMContentLoaded", function () {
  const activeTab = document.querySelector("nav ul li a.active");
  if (activeTab) {
    loadTab(activeTab.getAttribute('href').substring(1));
  }
});

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
      document.querySelectorAll("nav ul li a").forEach(t => t.classList.remove("active"));
      document.querySelector(`a[href="#${tabName}"]`).classList.add("active");
      attachProjectLinks();
    })
    .catch(err => {
      console.error("Error loading the content: ", err);
      mainContent.innerHTML = "<p>Error loading content</p>";
    });
}

function loadProject(projectURL) {
  const mainContent = document.getElementById("main-content");

  fetch(projectURL)
    .then(response => response.text())
    .then(data => {
      isInProjectWindow = true;
      mainContent.innerHTML = data;
    })
    .catch(error => {
      mainContent.innerHTML = `<p>Error loading project. Please try again.</p>`;
      console.error("Error loading project:", error);
    });
}

function attachProjectLinks() {
  const projectLinks = document.querySelectorAll(".project-link");
  projectLinks.forEach((link) => {
    link.addEventListener("click", function (event) {
      event.preventDefault();
      const projectURL = this.getAttribute("data-project");
      console.log("Loading project from:", projectURL);
      loadProject(projectURL);
    });
  });
}
var lastTab = '';

document.addEventListener("DOMContentLoaded", function () {
    const tabs = document.querySelectorAll("nav ul li a");
    const mainContent = document.getElementById("main-content");
  
    function loadContent(tab) {
        const tabName = tab.dataset.tab;

        if(tabName == lastTab) return;
        else lastTab = tabName;

        const path = `tabs/${tabName}.html`;
    
        fetch(path)
            .then(response => response.text())
            .then(data => {
                mainContent.innerHTML = data;
                tabs.forEach(t => t.classList.remove("active"));
                tab.classList.add("active");
        
                attachProjectLinks();
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
  
    const activeTab = document.querySelector("nav ul li a.active");
    if (activeTab) {
      loadContent(activeTab);
    }
  
    tabs.forEach((tab) => {
      tab.addEventListener("click", function (event) {
        event.preventDefault();
  
        tabs.forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
  
        loadContent(tab);
      });
    });
  });
  
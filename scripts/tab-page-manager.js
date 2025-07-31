var currentTab = '';
var isInProjectWindow = false;
var hasFilterHeader = false;
//var highlightedProjectIndex = 1000;

tabs = ([
        document.getElementById(tabsEnum.home),
        document.getElementById(tabsEnum.projects),
        document.getElementById(tabsEnum.about)
      ]);
var mainContent = document.getElementById("main-content");
var pageTitle = document.getElementById('page-title');
var pageTitleText = document.getElementById('page-title-text');
var headerMenuDropdown = document.getElementById('header-menu-dropdown');

function updateMainContent(data) {
  cleanupResources();
  scrollToTheTop();
  mainContent.innerHTML = data;
  startObsevingVideos();
}

/**
 * Used to load tabs/pages
 * @param {String} pageName Name of the tab/page
 * @param {boolean} isWindowPop If the loading is done by browser history back/forward change or not. Default = false
 */
function loadPage(pageName, isWindowPop = false) {
  if(!doesPageExist(pageName)) {
    loadPage(tabsEnum.home);
    return;
  };

  if(Object.values(tabsEnum).includes(pageName)) {
    tabName = pageName;

    if (tabName === currentTab && !isInProjectWindow) {
      scrollToTheTop();
      if(hasFilterHeader) closeFilterDropdown();
      return;
    } else {
      currentTab = tabName;
    }

    const path = `tabs/${tabName}.html`;

    fetch(path)
      .then(response => response.text())
      .then(data => {
        pageTitleText.innerHTML = "";
        pageTitle.classList.remove('active');
        if(!isWindowPop) history.pushState({page: tabName}, tabName, tabName);
        updateMainContent(data);
        perTabLoad(tabName);
        updateTabNav(tabName);
      })
      .catch(err => {
        console.error("Error loading the content: ", err);
      });
  } else {
    var folder = '';

    if(projectEnum.has(pageName)) {
      folder = 'project-pages/';
      updateTabNav(tabsEnum.projects);
    }

    const path = `${folder}${pageName}.html`;

    fetch(path)
    .then(response => response.text())
    .then(data => {
      pageTitleText.innerHTML = projectEnum.get(pageName); pageTitle.classList.add('active')
      if(!isWindowPop) history.pushState({page: pageName}, pageName, pageName);
      updateMainContent(data);
      isInProjectWindow = true;
    })
    .catch(error => {
      console.error("Error loading project:", error);
    });
  }
}

/**
 * Logic exclusive for each tab to perform as it gets loaded. Call this function in the loadPage() when it's handling tabs.
 * @param {string} tabName 
 */
function perTabLoad(tabName) {
  switch (tabName) {
    case tabsEnum.home:
      //getHightlightedProjects();
      break;
    case tabsEnum.projects:
      hasFilterHeader = true;
      loadProjects('card-container', 'assets/page-data-files/projects-data.json');
      break;
    default:
      break;
  }
}

/**
 * Scrolls the page to the top.
 */
function scrollToTheTop() {
  window.scrollTo(0, 0);
}

function openHeaderMenuDropdown() {
  if(headerMenuDropdown.classList.contains('show')) {
    headerMenuDropdown.classList.remove('show')
  }
  else {
    headerMenuDropdown.classList.add('show')
  }
}

/**
 * Cleans all resources to avoid memory leaks.
 */
function cleanupResources() {
  while (mainContent.firstChild) {
    mainContent.removeChild(mainContent.firstChild);
  }
  stopObservingVideos();
  highlightedProjectIndex = 1000;
  isInProjectWindow = false;
  hasFilterHeader = false;
}

/**
 * Find if pageName exists in database of tabs and pages names.
 * @param {String} pageName 
 * @returns true if the page exists
 * @returns false if page does not exist
 */
function doesPageExist(pageName) {
  if(
    Object.values(tabsEnum).includes(pageName) ||
    projectEnum.has(pageName)
  ) return true;
  return false;
}

function updateTabNav(tabName) {
  tabs.forEach(t => t.classList.remove("active"));
  document.getElementById(tabName).classList.add("active");
}

window.onpopstate = function(event) {
  const page = event.state.page;
  if (Object.values(tabsEnum).includes(page) || projectEnum.has(page)) {
    loadPage(page, true);
  } else {
    loadPage(tabsEnum.home, true);
  }
};

/*
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
  */
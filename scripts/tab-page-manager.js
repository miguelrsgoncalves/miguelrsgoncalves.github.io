var currentTab = '';
var isInProjectWindow = false;
var hasFilterHeader = false;

tabs = ([
  document.getElementsByName(tabsEnum.home),
  document.getElementsByName(tabsEnum.projects),
  document.getElementsByName(tabsEnum.about)
]);

pages = ([
  document.getElementsByName(pagesEnum.keys().next().value),
])

var mainContent = document.getElementById("main-content");
var pageTitle = document.getElementById('page-title');
var pageTitleText = document.getElementById('page-title-text');
var headerMenuButton = document.getElementById('header-menu-button');
var headerMenuDropdown = document.getElementById('header-menu-dropdown');

function updateMainContent(data) {
  cleanupResources();
  scrollToTheTop();
  mainContent.replaceChildren(document.createRange().createContextualFragment(data));
  loadIncludes();
  startObservingVideos();
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
        updateTabPageNav(tabName);
      })
      .catch(err => {
        console.error("Error loading the content: ", err);
      });
  } else {
    var folder = '';
    var currEnum = null;

    if(pagesEnum.has(pageName)) {
      folder = 'pages/';
      updateTabPageNav(pagesEnum.keys().next().value);
      currEnum = pagesEnum.get(pageName);
    } else if (projectsEnum.has(pageName)) {
      folder = 'project-pages/';
      updateTabPageNav(tabsEnum.projects);
      currEnum = projectsEnum.get(pageName);
    }

    const path = `${folder}${pageName}.html`;

    fetch(path)
    .then(response => response.text())
    .then(data => {
      pageTitleText.innerHTML = currEnum; pageTitle.classList.add('active')
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

document.addEventListener('click', (e) => {
  if (headerMenuDropdown.classList.contains('show') &&
      !headerMenuDropdown.contains(e.target) &&
      !headerMenuButton.contains(e.target)) {
    openHeaderMenuDropdown();
  }
});

/**
 * Cleans all resources to avoid memory leaks.
 */
function cleanupResources() {
  stopObservingVideos();
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
    pagesEnum.has(pageName) ||
    projectsEnum.has(pageName)
  ) return true;
  return false;
}

function updateTabPageNav(tabPageName) {
  tabs.forEach(t => t.forEach(y => y.classList.remove("active")));
  pages.forEach(p => p.forEach(y => y.classList.remove("active")));
  document.getElementsByName(tabPageName).forEach(e => e.classList.add("active"));
}

window.onpopstate = function(event) {
  const page = event.state.page;
  if (Object.values(tabsEnum).includes(page) || pagesEnum.has(page) || projectsEnum.has(page)) {
    loadPage(page, true);
  } else {
    loadPage(tabsEnum.home, true);
  }
};

function loadIncludes() {
  mainContent.querySelectorAll("[data-include]").forEach(async (element) => {
    const file = element.getAttribute("data-include");
    const html = await fetch(file).then(template => template.text());
    element.outerHTML = html;
  });
}
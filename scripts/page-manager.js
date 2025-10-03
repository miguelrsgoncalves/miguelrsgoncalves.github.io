var currentTab = ''
var isInProjectWindow = false

tabs = ([
  document.getElementsByName(tabsEnum.home),
  document.getElementsByName(tabsEnum.projects),
  document.getElementsByName(tabsEnum.about)
]);

pages = ([
  document.getElementsByName(pagesEnum.keys().next().value),
])

var mainContent = document.getElementById("main-content")
var pageTitle = document.getElementById('page-title')
var pageTitleText = document.getElementById('page-title-text')
var headerMenuButton = document.getElementById('header-menu-button')
var headerMenuDropdown = document.getElementById('header-menu-dropdown')

function updateMainContent(data) {
  scrollToTheTop(true)
  cleanupSignal.cleanup()
  mainContent.replaceChildren(document.createRange().createContextualFragment(data))
  loadIncludes()
}

/**
 * Starts the navigation process
 * @param {string} destination Name of the destination page
 * @param {boolean} browserHistory If the navigation is done by using the browser history feature
 */
function navigate(destination, isBrowserHistory = false) {
  if(!doesDestinationExist(destination)) {
    loadPage(tabsEnum.home)
    return
  }

  loadPage(destination, isBrowserHistory)
}

/**
 * Load selected page
 */
function loadPage(pageName, isWindowPop = false) {
  if(Object.values(tabsEnum).includes(pageName)) {
    tabName = pageName

    if (tabName === currentTab && !isInProjectWindow) {
      scrollToTheTop()
      return
    } else {
      currentTab = tabName
    }

    const path = `tabs/${tabName}.html`

    fetch(path)
      .then(response => response.text())
      .then(data => {
        isInProjectWindow = false
        pageTitleText.innerHTML = ""
        pageTitle.classList.remove('active')
        if(!isWindowPop) history.pushState({page: tabName}, tabName, tabName)
        updateMainContent(data)
        updateTabPageNav(tabName)
      })
      .catch(err => {
        console.error("Error loading the content: ", err)
      });
  } else {
    var folder = ''
    var currEnum = null

    if(pagesEnum.has(pageName)) {
      folder = 'pages/'
      updateTabPageNav(pagesEnum.keys().next().value)
      currEnum = pagesEnum.get(pageName)
    } else if (projectsEnum.has(pageName)) {
      folder = 'project-pages/'
      updateTabPageNav(tabsEnum.projects)
      currEnum = projectsEnum.get(pageName)
    }

    const path = `${folder}${pageName}.html`

    fetch(path)
    .then(response => response.text())
    .then(data => {
      pageTitleText.innerHTML = currEnum; pageTitle.classList.add('active')
      if(!isWindowPop) history.pushState({page: pageName}, pageName, pageName)
      updateMainContent(data)
      isInProjectWindow = true
    })
    .catch(error => {
      console.error("Error loading project:", error)
    });
  }
}

/**
 * Scrolls the page to the top
 * @param {*} instant true if the scroll should be instant
 */
function scrollToTheTop(instant) {
  if(instant) {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant"
    })
  } else window.scrollTo(0, 0)
}

function toggleHeaderMenuDropdown() {
  if(headerMenuDropdown.classList.contains('show')) {
    headerMenuDropdown.classList.remove('show')
  }
  else {
    headerMenuDropdown.classList.add('show')
  }
}

/**
 * Find if destination exists in database of destination names.
 * @param {String} destination 
 * @returns true if the page exists
 * @returns false if page does not exist
 */
function doesDestinationExist(destination) {
  if(
    Object.values(tabsEnum).includes(destination) ||
    pagesEnum.has(destination) ||
    projectsEnum.has(destination)
  ) return true
  return false
}

function updateTabPageNav(tabPageName) {
  tabs.forEach(t => t.forEach(y => y.classList.remove("active")))
  pages.forEach(p => p.forEach(y => y.classList.remove("active")))
  document.getElementsByName(tabPageName).forEach(e => e.classList.add("active"))
}

function loadIncludes() {
  mainContent.querySelectorAll("[data-include]").forEach(async (element) => {
    const file = element.getAttribute("data-include")
    const html = await fetch(file).then(template => template.text())
    element.outerHTML = html
  });
}

window.onpopstate = function(event) {
  const page = event.state.page
  if (Object.values(tabsEnum).includes(page) || pagesEnum.has(page) || projectsEnum.has(page)) {
    loadPage(page, true)
  } else {
    loadPage(tabsEnum.home, true)
  }
};

document.addEventListener('click', (e) => {
  if (headerMenuDropdown.classList.contains('show') &&
      !headerMenuDropdown.contains(e.target) &&
      !headerMenuButton.contains(e.target)) {
    toggleHeaderMenuDropdown();
  }
});

window.addEventListener("resize", () => {
  initScrollables()
})

function initScrollables() {
  const velocity = 100
    document.querySelectorAll(".scrollable").forEach(el => {
        let overflow = el.scrollWidth - el.clientWidth
        if(overflow > 0) {
          const rawDuration = velocity / Math.pow(overflow, 1)
          const duration = Math.min(Math.min((rawDuration, 2), 15))
          el.style.setProperty("--scroll-distance", `-${overflow}px`)
          el.style.setProperty("--scroll-duration", `${duration}s`)
          el.classList.add("scroll")
        }
        else {
          el.classList.remove("scroll")
          el.style.removeProperty("--scroll-distance")
        }
    })
}
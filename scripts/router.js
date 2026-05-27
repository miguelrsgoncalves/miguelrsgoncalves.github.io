var currentTab = ''
var isInProjectWindow = false

const tabsEnum = {
  home: "home",
  projects: "projects",
  about: "about"
}
const DEFAULT_PAGE = tabsEnum.projects

const pagesEnum = new Map([
    ["portfolio", "Portfolio"],
]);

const projectsEnum = new Map([
    ["abyssal-descent", "Abyssal Descent: SCP-455"],
    ["chat95", "Chat95"],
    ["cglf-custom-global-light-function", "CGLF — Custom Global Light Function"],
    ["egg-hunt", "Egg Hunt"],
    ["hand-of-god", "Hand of God"],
    ["grass-field", "Grass Field"],
    ["godot-engine", "Godot Engine"],
    ["hums-of-the-soul", "Hums of the Soul"],
    ["hums-of-the-soul-first-light", "Hums of the Soul: First Light"],
    ["limbo-gaol", "Limbo's Gaol"],
    ["narrow-escape", "Narrow Escape"],
    ["papers-please-the-short-film-spatial-audio-only-adaptation", "PAPERS, PLEASE - The Short Film | Spatial Audio-Only Adaptation"],
    ["paranoia", "Paranoia"],
    ["personal-website", "Personal Website"],
    ["pigment", "Pigment"],
    ["play-with-me", "PLAY WITH ME"],
    ["sisyphus-climb", "Sisyphus Climb"],
    ["the-player-eye", "The Player's Eye"],
    ["sprite-sheet-padder", "Sprite Sheet Padder"],
    ["webgl-train", "WebGL Train"],
    ["well-of-wandering", "Well of Wandering"],
]);

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
 * @param {boolean} browserHistory If the navigation is done by using the browser history
 */
function navigate(destination, folder = "", isBrowserHistory = false) {
  if (!doesRouteExist(destination, folder)) {
    loadPage(DEFAULT_PAGE);
    return;
  }

  if (isTabRoute(destination) && currentPage === destination) {
    scrollToTheTop();
    return;
  }
  
  loadPage(destination, isBrowserHistory);
}

function loadPage(pageName, folder, isWindowPop = false) {
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

    const path = `${pageName}.html`

    fetch(path)
    .then(response => {
        if (!response.ok) throw new Error("HTTP error " + response.status);
        return response.text();
    })
    .then(data => {
      if (data.includes("<!DOCTYPE html>") || data.includes("<title>MRSG</title>")) {
          console.error("Error: Page not found. Path was:", path);
          // TODO: Load a dedicated 404 page here
          return;
      }

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
 * Find if destination file exists.
 * @param {String} destination
 * @param {String} folder
 * @returns {boolean}
 */
function doesRouteExist(destination, folder) {
  const url = folder + destination

  fetch(url)
      .then(response => {
        return true ? response.ok : false
      })
      .catch(err => {
        return false
      });
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
    //loadPage(tabsEnum.home, true)
    loadPage(tabsEnum.projects, true)
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
  document.querySelectorAll(".h-scrollable").forEach(el => {
      let overflow = el.scrollWidth - el.clientWidth
      if(overflow > 0) {
        el.style.setProperty("--scroll-distance", `-${overflow}px`)
        el.classList.add("h-scroll")
      }
      else {
        el.classList.remove("h-scroll")
        el.style.removeProperty("--scroll-distance")
      }
  })

  document.querySelectorAll(".v-scrollable").forEach(el => {
      let overflow = el.scrollHeight - el.clientHeight
      if(overflow > 0) {
        el.style.setProperty("--scroll-distance", `-${overflow}px`)
        el.classList.add("v-scroll")
      }
      else {
        el.classList.remove("v-scroll")
        el.style.removeProperty("--scroll-distance")
      }
  })
}

document.addEventListener('click', (e) => {
  const link = e.target.closest('a');

  if (link) {
    const href = link.getAttribute('href');

    if (e.button === 0 && !e.ctrlKey && !e.shiftKey && !e.metaKey) {
      const destination = href.startsWith('/') ? href.substring(1) : href;

      if (doesRouteExist(destination)) {
        e.preventDefault();
        
        if (link.closest('#header-menu-dropdown')) {
          toggleHeaderMenuDropdown();
        }
        
        navigate(destination);
      }
    }
  }
});
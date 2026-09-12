//#region state

const mainContent = document.querySelector('main');
const routeTitle = document.getElementById('route-title');
const routeTitleText = document.getElementById('route-title-text');
const headerMenuButton = document.getElementById('header-menu-button');
const headerMenuDropdown = document.getElementById('header-menu-dropdown');

const DEFAULT_ROUTE = 'projects';
let currentRoute = null;
let hydrated = false;

let navId = 0;

let loadingSpinnerElement = null;
let spinnerTimer = null;
const SPINNER_DELAY = 500;

//#endregion

//#region navigate

async function navigate(route, isPopstate) {
  if (!route) { navigate(DEFAULT_ROUTE, isPopstate); return; }

  const segments = route.split('/').filter(Boolean);

  if (!isPopstate && route === currentRoute) {
    scrollToTheTop();
    return;
  }

  if (!hydrated && isPopstate && mainContent.children.length > 0) {
    hydrated = true;
    currentRoute = route;
    showRouteTitle(
      routeTitleFromPageTitle(document.title),
      mainContent.hasAttribute('data-hide-route-title')
    );
    updateNav(segments);
    requestAnimationFrame(initScrollables);
    return;
  }

  hydrated = true;

  const id = ++navId;

  const currentPages = mainContent.querySelectorAll('.page');
  let exitDone;

  if (currentPages.length > 0) {
    currentPages.forEach(page => {
      page.classList.remove('exiting');
      void page.offsetWidth;
      page.classList.add('exiting');
    });

    exitDone = new Promise(resolve => {
      let remaining = currentPages.length;
      const fallback = setTimeout(resolve, 250);
      currentPages.forEach(page => {
        page.addEventListener('animationend', function handler() {
          page.removeEventListener('animationend', handler);
          if (--remaining === 0) {
            clearTimeout(fallback);
            resolve();
          }
        }, { once: true });
      });
    });
  } else {
    exitDone = Promise.resolve();
  }

  const pageUrl = `/${route}/`;

  spinnerTimer = setTimeout(showSpinner, SPINNER_DELAY);

  let page;
  try {
    const response = await fetch(pageUrl);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    page = await response.text();

  } catch (err) {
    hideSpinner();
    mainContent.querySelectorAll('.page.exiting').forEach(p => p.classList.remove('exiting'));
    console.error('Failed to load:', pageUrl, err);
    if (route !== DEFAULT_ROUTE) navigate(DEFAULT_ROUTE);
    return;
  }

  if (id !== navId) { hideSpinner(); return; }

  hideSpinner();

  await exitDone;
  if (id !== navId) return;

  render(id, route, segments, page, isPopstate);
}

//#endregion

//#region render

async function render(id, route, segments, page, isPopstate) {
  currentRoute = route;

  const fetched = new DOMParser().parseFromString(page, 'text/html');
  const fetchedMain = fetched.querySelector('main');

  syncHead(fetched);

  showRouteTitle(
    routeTitleFromPageTitle(fetched.title),
    fetchedMain.hasAttribute('data-hide-route-title')
  );

  updateNav(segments);
  if (!isPopstate) history.pushState({ route }, '', `/${route}`);

  unloadRouteAssets();
  pageCleanup.run();

  scrollToTheTop(true);

  mainContent.replaceChildren(...fetchedMain.childNodes);

  await adoptRouteAssets(fetched);
  if (id !== navId) return;

  adoptRouteScripts(fetched);

  await loadIncludes();
  if (id !== navId) return;

  requestAnimationFrame(initScrollables);
  createIcons();
}

function syncHead(fetched) {
  document.title = fetched.title;

  for (const [selector, attributeName] of HEAD_SYNC) {
    syncHeadTag(fetched, selector, attributeName);
  }

  syncHeadTag(fetched, 'link[rel="canonical"]', 'href');
}

const HEAD_SYNC = [
  ['meta[name="description"]', 'content'],
  ['meta[property="og:title"]', 'content'],
  ['meta[property="og:description"]', 'content'],
  ['meta[property="og:url"]', 'content'],
  ['meta[property="og:image"]', 'content'],
  ['meta[name="twitter:card"]', 'content'],
  ['meta[name="twitter:title"]', 'content'],
  ['meta[name="twitter:description"]', 'content'],
  ['meta[name="twitter:image"]', 'content'],
];

function syncHeadTag(fetched, selector, attributeName) {
  const fetchedElement = fetched.head.querySelector(selector);

  if (!fetchedElement) return;

  let element = document.head.querySelector(selector);

  if (!element) {
    element = fetchedElement.cloneNode(false);
    document.head.appendChild(element);
  }

  element.setAttribute(attributeName, fetchedElement.getAttribute(attributeName));
}

function routeTitleFromPageTitle(pageTitle) {
  return pageTitle === 'MRSG' ? '' : pageTitle.replace(/^MRSG \| /, '');
}

function adoptRouteAssets(fetched) {
  const promises = [];

  for (const element of fetched.head.querySelectorAll('link[route-fragment]')) {
    const href = element.getAttribute('href');

    if (document.head.querySelector(`link[route-fragment][href="${href}"]`)) continue;

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.setAttribute('route-fragment', '');
    document.head.appendChild(link);
  }

  for (const element of fetched.head.querySelectorAll('script[route-fragment]')) {
    const src = element.getAttribute('src');

    if (document.head.querySelector(`script[route-fragment][src="${src}"]`)) continue;

    promises.push(new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.setAttribute('route-fragment', '');
      script.onload = resolve;
      script.onerror = () => {
        console.warn('Failed to load route script:', src);
        resolve();
      };
      document.head.appendChild(script);
    }));
  }

  return Promise.all(promises);
}

function adoptRouteScripts(fetched) {
  for (const element of fetched.body.querySelectorAll('script[route-fragment]')) {
    const script = document.createElement('script');
    script.textContent = element.textContent;
    script.setAttribute('route-fragment', '');
    document.head.appendChild(script);
  }
}

function unloadRouteAssets() {
  document.querySelectorAll('script[route-fragment], link[route-fragment]').forEach(element => element.remove());
}

function getSpinner() {
  if (!loadingSpinnerElement) {
    loadingSpinnerElement = document.createElement('div');
    loadingSpinnerElement.className = 'loading-spinner';
    loadingSpinnerElement.setAttribute('aria-hidden', 'true');
    loadingSpinnerElement.innerHTML = '<div class="ring"></div>';
  }
  return loadingSpinnerElement;
}

function showSpinner() {
  const element = getSpinner();
  if (!element.parentNode) document.body.appendChild(element);
  element.classList.add('visible');
}

function hideSpinner() {
  clearTimeout(spinnerTimer);
  spinnerTimer = null;
  if (loadingSpinnerElement) loadingSpinnerElement.classList.remove('visible');
}

//#endregion

//#region helpers

function showRouteTitle(title, hide) {
  if (title && !hide) {
    routeTitleText.innerHTML = title;
    routeTitle.classList.add('active');
  } else {
    routeTitleText.innerHTML = '';
    routeTitle.classList.remove('active');
  }
}

function updateNav(segments) {
  const active = new Set(segments);
  document.querySelectorAll('a[name]').forEach(a =>
    a.classList.toggle('active', active.has(a.getAttribute('name')))
  );
}

async function loadIncludes() {
  const includes = mainContent.querySelectorAll('[data-include]');
  await Promise.all(Array.from(includes).map(async el => {
    try {
      const res = await fetch(el.getAttribute('data-include'));
      el.outerHTML = await res.text();
    } catch (err) {
      console.error('Failed to load include:', err);
    }
  }));
}

//#endregion

//#region ui

function scrollToTheTop(instant) {
  window.scrollTo({ top: 0, left: 0, behavior: instant ? 'instant' : 'smooth' });
}

function toggleHeaderMenuDropdown() {
  headerMenuDropdown.classList.toggle('show');
}

function initScrollables() {
  [
    { sel: '.h-scrollable', fn: el => el.scrollWidth - el.clientWidth, cls: 'h-scroll' },
    { sel: '.v-scrollable', fn: el => el.scrollHeight - el.clientHeight, cls: 'v-scroll' }
  ].forEach(({ sel, fn, cls }) =>
    document.querySelectorAll(sel).forEach(el => {
      const px = fn(el);
      if (px > 0) {
        el.style.setProperty('--scroll-distance', `-${px}px`);
        el.classList.add(cls);
      } else {
        el.classList.remove(cls);
        el.style.removeProperty('--scroll-distance');
      }
    })
  );
}

//#endregion

//#region events

window.onpopstate = ({ state }) => {
  navigate(state ? state.route : DEFAULT_ROUTE, true);
};

document.addEventListener('click', e => {
  if (
    headerMenuDropdown.classList.contains('show') &&
    !headerMenuDropdown.contains(e.target) &&
    !headerMenuButton.contains(e.target)
  ) toggleHeaderMenuDropdown();

  const link = e.target.closest('a[href]');
  if (!link || e.button !== 0 || e.ctrlKey || e.shiftKey || e.metaKey) return;

  const href = link.getAttribute('href');
  if (!href || !href.startsWith('/')) return;
  if (href.split('/').pop().includes('.')) return;

  e.preventDefault();
  if (link.closest('#header-menu-dropdown')) toggleHeaderMenuDropdown();
  navigate(href.slice(1));
});

window.addEventListener('resize', initScrollables);

//#endregion

//#region pageCleanup

const pageCleanup = {
  _callbacks: [],

  register(fn) {
    this._callbacks.push(fn);
  },

  run() {
    this._callbacks.forEach(fn => { try { fn(); } catch (e) {} });
    this._callbacks = [];
  }
};

//#endregion

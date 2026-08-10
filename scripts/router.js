//#region state

const mainContent = document.querySelector('main');
const routeTitle = document.getElementById('route-title');
const routeTitleText = document.getElementById('route-title-text');
const headerMenuButton = document.getElementById('header-menu-button');
const headerMenuDropdown = document.getElementById('header-menu-dropdown');

const ROOT_ROUTE = '/pages/';
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
    const data = mainContent.querySelector('route-data');
    showRouteTitle(
      data ? data.dataset.title : null,
      data ? data.hasAttribute('data-hide-route-title') : false
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

  const filePath = segments.length === 1 ? `${ROOT_ROUTE}tabs/${route}` : ROOT_ROUTE + route;

  spinnerTimer = setTimeout(showSpinner, SPINNER_DELAY);

  let html;
  try {
    const response = await fetch(`${filePath}.html`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    html = await response.text();
    if (html.includes('<!DOCTYPE html>')) throw new Error('Page not found');

  } catch (err) {
    hideSpinner();
    mainContent.querySelectorAll('.page.exiting').forEach(p => p.classList.remove('exiting'));
    console.error('Failed to load:', filePath, err);
    if (route !== DEFAULT_ROUTE) navigate(DEFAULT_ROUTE);
    return;
  }

  if (id !== navId) { hideSpinner(); return; }

  hideSpinner();

  await exitDone;
  if (id !== navId) return;

  render(route, segments, html, isPopstate);
}

//#endregion

//#region render

function render(route, segments, html, isPopstate) {
  currentRoute = route;

  const fragment = document.createRange().createContextualFragment(html);

  const meta = fragment.querySelector('route-data');
  const title = meta ? meta.dataset.title : null;
  const description = meta ? (meta.dataset.description || '') : '';
  const hide = meta ? meta.hasAttribute('data-hide-route-title') : false;
  const fileScripts = parseList(meta ? meta.dataset.js : '');
  const fileStyles = parseList(meta ? meta.dataset.css : '');

  const inlineScripts = [];
  fragment.querySelectorAll('script').forEach(script => {
    const code = script.textContent.trim();
    if (code) inlineScripts.push(code);
    script.remove();
  });

  const route_data = fragment.querySelector('route-data');
  if (route_data) route_data.remove();

  showRouteTitle(title, hide);
  document.title = title ? `MRSG | ${title}` : 'MRSG';

  const descEl = document.querySelector('meta[name="description"]');
  if (descEl) descEl.setAttribute('content', description);

  setMeta('og:title', title ? `MRSG | ${title}` : 'MRSG');
  setMeta('og:description', description);
  setMeta('og:url', `${window.location.origin}/${route}/`);

  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }
  canonical.setAttribute('href', `${window.location.origin}/${route}/`);

  updateNav(segments);
  if (!isPopstate) history.pushState({ route }, '', `/${route}`);

  loadPageStyles(fileStyles);
  const scriptsPromise = loadPageScripts(fileScripts);

  unloadPageScripts();
  pageCleanup.run();

  scrollToTheTop(true);

  mainContent.replaceChildren(fragment);

  scriptsPromise.then(() => {
    inlineScripts.forEach(code => {
      const script = document.createElement('script');
      script.textContent = code;
      script.setAttribute('data-page', '');
      document.head.appendChild(script);
    });
    return loadIncludes();
  }).then(() => {
    requestAnimationFrame(initScrollables);
    createIcons();
  });
}

function parseList(raw) {
  if (!raw) return [];
  try { return JSON.parse(raw); } catch (e) { return []; }
}

function loadPageScripts(paths) {
  const promises = paths
    .filter(src => !document.querySelector(`script[data-page][src="${src}"]`))
    .map(src => new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.setAttribute('data-page', '');
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    }));
  return Promise.all(promises);
}

function loadPageStyles(paths) {
  paths.forEach(href => {
    if (document.querySelector(`link[data-page][href="${href}"]`)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.setAttribute('data-page', '');
    document.head.appendChild(link);
  });
}

function unloadPageScripts() {
  document.querySelectorAll('script[data-page], link[data-page]').forEach(element => element.remove());
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

function setMeta(property, content) {
  let tag = document.querySelector(`meta[property="${property}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('property', property);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
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

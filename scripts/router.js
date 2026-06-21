const mainContent = document.getElementById('main-content');
const routeTitle = document.getElementById('route-title');
const routeTitleText = document.getElementById('route-title-text');
const headerMenuButton = document.getElementById('header-menu-button');
const headerMenuDropdown = document.getElementById('header-menu-dropdown');

const ROOT_ROUTE = "/pages/"
const DEFAULT_ROUTE = 'projects';
let currentRoute = null;

/**
 * Navigate to a route.
 *
 * @param {string}  route
 * @param {boolean} isWindowPop true when called from browser history
 */
function navigate(route, isWindowPop = false) {
  if (!route) { navigate(DEFAULT_ROUTE, isWindowPop); return; }

  const segments = route.split('/').filter(Boolean);

  if (!isWindowPop && route === currentRoute) {
    scrollToTheTop();
    return;
  }

  const filePath = segments.length === 1 ? `${ROOT_ROUTE}tabs/${route}` : ROOT_ROUTE + route;

  fetch(`${filePath}.html`)
    .then(response => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.text();
    })
    .then(html => {
      if (html.includes('<!DOCTYPE html>')) {
        console.error('Page not found:', filePath);
        navigate(DEFAULT_ROUTE);
        return;
      }
      render(route, segments, html, isWindowPop);
    })
    .catch(err => {
      console.error('Failed to load:', filePath, err);
      if (route !== DEFAULT_ROUTE) navigate(DEFAULT_ROUTE);
    });
}

function render(route, segments, html, isWindowPop) {
  currentRoute = route;

  const {
    title,
    description
  } = getRouteMetadata(html)

  if (title) {
    routeTitleText.innerHTML = title;
    routeTitle.classList.add('active');
  } else {
    routeTitleText.innerHTML = '';
    routeTitle.classList.remove('active');
  }
  
  document.title = title ? `MRSG | ${title}` : 'MRSG';
  
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.setAttribute('content', description);
  }

  updateOgTag('og:title', title ? `MRSG | ${title}` : 'MRSG');
  updateOgTag('og:description', description);
  updateOgTag('og:url', `${window.location.origin}/${route}`);

  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }
  canonical.setAttribute('href', `${window.location.origin}/${route}`);

  updateNav(segments);

  if (!isWindowPop) {
    history.pushState({ route }, '', `/${route}`);
  }

  updateContent(html);
}

function getRouteMetadata(html) {
  const scratch = document.createElement('div');
  scratch.innerHTML = html;
  const meta = scratch.querySelector('route-data');
  
  return {
    title: meta?.getAttribute("title") ?? null,
    description: meta?.getAttribute("description") ?? ""
  };
}

function updateOgTag(property, content) {
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

async function updateContent(html) {
  scrollToTheTop(true);
  cleanupSignal.cleanup();
  mainContent.replaceChildren(document.createRange().createContextualFragment(html));
  
  await loadIncludes();
  
  requestAnimationFrame(initScrollables);
  createIcons()
}

async function loadIncludes() {
  const includes = mainContent.querySelectorAll('[data-include]');
  const promises = Array.from(includes).map(async el => {
    const file = el.getAttribute('data-include');
    try {
      const response = await fetch(file);
      const text = await response.text();
      el.outerHTML = text;
    } catch (err) {
      console.error('Failed to load include:', file, err);
    }
  });
  
  await Promise.all(promises);
}

function scrollToTheTop(instant = false) {
  window.scrollTo({ top: 0, left: 0, behavior: instant ? 'instant' : 'smooth' });
}

function toggleHeaderMenuDropdown() {
  headerMenuDropdown.classList.toggle('show');
}

function initScrollables() {
  [
    { sel: '.h-scrollable', fn: el => el.scrollWidth  - el.clientWidth,  cls: 'h-scroll' },
    { sel: '.v-scrollable', fn: el => el.scrollHeight - el.clientHeight, cls: 'v-scroll' },
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

//#region events

window.onpopstate = ({ state }) => {
  navigate(state?.route ?? DEFAULT_ROUTE, true);
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
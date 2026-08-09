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

//#endregion

//#region navigate

function navigate(route, isPopstate) {
  if (!route) { navigate(DEFAULT_ROUTE, isPopstate); return; }

  var segments = route.split('/').filter(Boolean);

  if (!isPopstate && route === currentRoute) {
    scrollToTheTop();
    return;
  }

  if (!hydrated && isPopstate && mainContent.children.length > 0) {
    hydrated = true;
    currentRoute = route;
    var meta = mainContent.querySelector('route-data');
    showRouteTitle(
      meta ? meta.dataset.title : null,
      meta ? meta.hasAttribute('data-hide-route-title') : false
    );
    updateNav(segments);
    requestAnimationFrame(initScrollables);
    return;
  }

  hydrated = true;

  var filePath = segments.length === 1
    ? ROOT_ROUTE + 'tabs/' + route
    : ROOT_ROUTE + route;

  fetch(filePath + '.html')
    .then(function (response) {
      if (!response.ok) throw new Error('HTTP ' + response.status);
      return response.text();
    })
    .then(function (html) {
      if (html.indexOf('<!DOCTYPE html>') !== -1) {
        console.error('Page not found:', filePath);
        navigate(DEFAULT_ROUTE);
        return;
      }
      render(route, segments, html, isPopstate);
    })
    .catch(function (err) {
      console.error('Failed to load:', filePath, err);
      if (route !== DEFAULT_ROUTE) navigate(DEFAULT_ROUTE);
    });
}

//#endregion

//#region render

async function render(route, segments, html, isPopstate) {
  currentRoute = route;

  var fragment = document.createRange().createContextualFragment(html);

  var meta = fragment.querySelector('route-data');
  var title = meta ? meta.dataset.title : null;
  var description = meta ? (meta.dataset.description || '') : '';
  var hide = meta ? meta.hasAttribute('data-hide-route-title') : false;
  var fileScripts = parseList(meta ? meta.dataset.js : '');
  var fileStyles = parseList(meta ? meta.dataset.css : '');

  var inlineScripts = [];
  fragment.querySelectorAll('script').forEach(function (s) {
    var code = s.textContent.trim();
    if (code) inlineScripts.push(code);
    s.remove();
  });

  var rd = fragment.querySelector('route-data');
  if (rd) rd.remove();

  showRouteTitle(title, hide);
  document.title = title ? 'MRSG | ' + title : 'MRSG';
  var descEl = document.querySelector('meta[name="description"]');
  if (descEl) descEl.setAttribute('content', description);
  setMeta('og:title', title ? 'MRSG | ' + title : 'MRSG');
  setMeta('og:description', description);
  setMeta('og:url', window.location.origin + '/' + route + '/');

  var canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }
  canonical.setAttribute('href', window.location.origin + '/' + route + '/');

  updateNav(segments);
  if (!isPopstate) history.pushState({ route: route }, '', '/' + route);

  unloadPageScripts();
  pageCleanup.run();

  scrollToTheTop(true);
  mainContent.replaceChildren(fragment);

  loadPageStyles(fileStyles);
  await loadPageScripts(fileScripts);

  inlineScripts.forEach(function (code) {
    var s = document.createElement('script');
    s.textContent = code;
    s.setAttribute('data-page', '');
    document.head.appendChild(s);
  });

  loadIncludes().then(function () {
    requestAnimationFrame(initScrollables);
    createIcons();
  });
}

//#endregion

//#region scripts

function parseList(raw) {
  if (!raw) return [];
  try { return JSON.parse(raw); } catch (e) { return []; }
}

async function loadPageScripts(paths) {
  var promises = [];
  for (var i = 0; i < paths.length; i++) {
    var src = paths[i];
    if (document.querySelector('script[data-page][src="' + src + '"]')) continue;
    promises.push(new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = src;
      s.setAttribute('data-page', '');
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    }));
  }
  await Promise.all(promises);
}

function loadPageStyles(paths) {
  for (var i = 0; i < paths.length; i++) {
    var href = paths[i];
    if (document.querySelector('link[data-page][href="' + href + '"]')) continue;
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.setAttribute('data-page', '');
    document.head.appendChild(link);
  }
}

function unloadPageScripts() {
  document.querySelectorAll('script[data-page]').forEach(function (s) { s.remove(); });
  document.querySelectorAll('link[data-page]').forEach(function (l) { l.remove(); });
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
  var tag = document.querySelector('meta[property="' + property + '"]');
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('property', property);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

function updateNav(segments) {
  var active = {};
  segments.forEach(function (s) { active[s] = true; });
  document.querySelectorAll('a[name]').forEach(function (a) {
    a.classList.toggle('active', !!active[a.getAttribute('name')]);
  });
}

async function loadIncludes() {
  var includes = mainContent.querySelectorAll('[data-include]');
  var promises = Array.from(includes).map(function (el) {
    return fetch(el.getAttribute('data-include'))
      .then(function (res) { return res.text(); })
      .then(function (text) { el.outerHTML = text; })
      .catch(function (err) { console.error('Failed to load include:', err); });
  });
  await Promise.all(promises);
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
    { sel: '.h-scrollable', fn: function (el) { return el.scrollWidth - el.clientWidth; }, cls: 'h-scroll' },
    { sel: '.v-scrollable', fn: function (el) { return el.scrollHeight - el.clientHeight; }, cls: 'v-scroll' }
  ].forEach(function (spec) {
    document.querySelectorAll(spec.sel).forEach(function (el) {
      var px = spec.fn(el);
      if (px > 0) {
        el.style.setProperty('--scroll-distance', '-' + px + 'px');
        el.classList.add(spec.cls);
      } else {
        el.classList.remove(spec.cls);
        el.style.removeProperty('--scroll-distance');
      }
    });
  });
}

//#endregion

//#region events

window.onpopstate = function (e) {
  navigate(e.state ? e.state.route : DEFAULT_ROUTE, true);
};

document.addEventListener('click', function (e) {
  if (
    headerMenuDropdown.classList.contains('show') &&
    !headerMenuDropdown.contains(e.target) &&
    !headerMenuButton.contains(e.target)
  ) toggleHeaderMenuDropdown();

  var link = e.target.closest('a[href]');
  if (!link || e.button !== 0 || e.ctrlKey || e.shiftKey || e.metaKey) return;

  var href = link.getAttribute('href');
  if (!href || href.charAt(0) !== '/' || href.split('/').pop().indexOf('.') !== -1) return;

  e.preventDefault();
  if (link.closest('#header-menu-dropdown')) toggleHeaderMenuDropdown();
  navigate(href.slice(1));
});

window.addEventListener('resize', initScrollables);

//#endregion

//#region pageCleanup

var pageCleanup = {
  _callbacks: [],

  register: function (fn) {
    this._callbacks.push(fn);
  },

  run: function () {
    this._callbacks.forEach(function (fn) {
      try { fn(); } catch (e) {}
    });
    this._callbacks = [];
  }
};

//#endregion
window.addEventListener('DOMContentLoaded', () => {
  const pathParam = new URLSearchParams(window.location.search).get('path');
  if (pathParam) {
    history.replaceState({ route: pathParam }, '', `/${pathParam}`);
    navigate(pathParam, true);
    return;
  }
 
  const path = window.location.pathname.replace(/^\/|\/$/g, '');
  const route = (path && path !== 'index.html') ? path : DEFAULT_ROUTE;
  history.replaceState({ route }, '', `/${route}`);
  navigate(route, true);

  createIcons()
});


const header = document.querySelector('header');

const updateHeaderHeight = () => {
    const headerHeight = header.offsetHeight;
    document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
};

const headerObserver = new ResizeObserver(updateHeaderHeight);

if (header) {
    headerObserver.observe(header);
    updateHeaderHeight();
}
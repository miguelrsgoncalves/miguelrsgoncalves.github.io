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
});

var redirect = null;
try { redirect = sessionStorage.getItem('redirect'); } catch (e) {}
if (redirect) {
  try { sessionStorage.removeItem('redirect'); } catch (e) {}
  history.replaceState(null, '', redirect);
}

var path = window.location.pathname.replace(/^\/|\/$/g, '');
var route = (path && path !== 'index.html') ? path : DEFAULT_ROUTE;
history.replaceState({ route: route }, '', '/' + route);

navigate(route, true);
createIcons();

var header = document.querySelector('header');
if (header) {
  var updateHeight = function () {
    document.documentElement.style.setProperty('--header-height', header.offsetHeight + 'px');
  };

  var observer = new ResizeObserver(updateHeight);
  observer.observe(header);
  updateHeight();
}
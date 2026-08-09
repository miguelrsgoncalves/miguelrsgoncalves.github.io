var videoObserver = (function () {
  const options = { threshold: 0.35 };
  var observer = null;

  function init() {
    observer = new IntersectionObserver(handleIntersection, options);
    pageCleanup.register(cleanup);
    document.querySelectorAll('video[autoplay]').forEach(function (video) {
      observer.observe(video);
    });
  }

  function handleIntersection(entries) {
    entries.forEach(function (entry) {
      const video = entry.target;
      if (entry.isIntersecting) {
        if (!video.src) {
          video.src = video.dataset.src;
          video.load();
        }
        video.play().catch(function () {});
      } else {
        if (!video.paused) {
          video.pause();
        }
      }
    });
  }

  function cleanup() {
    if (observer) observer.disconnect();
  }

  init();

  return { init: init, cleanup: cleanup };
})();

const observerOptions = { threshold: 0.35 };
const videoObserver = new IntersectionObserver(handleIntersection, observerOptions);

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

document.querySelectorAll('video[autoplay]').forEach(function (video) {
  videoObserver.observe(video);
});

pageCleanup.register(function () {
  videoObserver.disconnect();
});

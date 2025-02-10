const options = {
    threshold: 0.25,
  };
  
var handleIntersection = (entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            if (entry.target.paused) {
                entry.target.play();
            }
        } else {
            if (!entry.target.paused) {
                entry.target.pause();
            }
        }
    });
};

const observer = new IntersectionObserver(handleIntersection, options);

function startObsevingVideos () {
    document.querySelectorAll('video[autoplay]').forEach(video => {
        observer.observe(video);
    });
}

function stopObservingVideos () {
    observer.disconnect();
}
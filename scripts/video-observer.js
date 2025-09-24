const videoObserver = (() => {
    const options = {
        threshold: 0.35,
    }
    var observer = null

    function init() {
        observer = new IntersectionObserver(handleIntersection, options)
        cleanupSignal.subscribe(cleanup)
        document.querySelectorAll('video[autoplay]').forEach(video => {
            observer.observe(video)
        })
    }
    
    var handleIntersection = (entries) => {
        entries.forEach(entry => {
            const video = entry.target
            if (entry.isIntersecting) {
                if (!video.src) {
                    video.src = video.dataset.src
                    video.load()
                }
                video.play().catch(err => {})
            } else {
                if (!video.paused) {
                    video.pause()
                }
            }
        })
    }

    function cleanup() {
        observer.disconnect()
    }

    return { init }
})()
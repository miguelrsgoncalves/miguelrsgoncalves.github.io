document.addEventListener("DOMContentLoaded", function () {
    try {
        loadPage(window.location.pathname)
    } catch (error) {
        loadPage(tabsEnum.home);
        console.log('URL not found. Redericting to Home page.')
    }

    /**
     * DEBUG ONLY! LOADS A DIFFERENT INITIAL PAGE FOR EASIER DEBBUGING AND DEVELOPMENT
    */
    //loadPage("papers-please-the-short-film-spatial-audio-only-adaptation", "!!TESTING PAGE AUTO STARTING LOAD!! REMOVE BEFORE DEPLOYMENT!!");
    /**
     * COMMENT LINE ABOVE FOR DEPLOYMENT AND UNCOMMENT TOP MOST COMMENT
     */
});
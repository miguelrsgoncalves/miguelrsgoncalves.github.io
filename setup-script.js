document.addEventListener("DOMContentLoaded", function () {
    let path = window.location.pathname;

    const stored = sessionStorage.getItem("redirectAfterReload");
    if (stored) {
        sessionStorage.removeItem("redirectAfterReload");
        path = stored;
        history.replaceState({}, "", stored);
        try {
            loadPage(history.state.page)
        } catch (error) {
            loadPage(tabsEnum.home);
            console.log('URL not found. Redericting to Home page.')
        }
    } else loadPage(tabsEnum.home);

    /**
     * DEBUG ONLY! LOADS A DIFFERENT INITIAL PAGE FOR EASIER DEBBUGING AND DEVELOPMENT
    */
    //loadPage("papers-please-the-short-film-spatial-audio-only-adaptation", "!!TESTING PAGE AUTO STARTING LOAD!! REMOVE BEFORE DEPLOYMENT!!");
    /**
     * COMMENT LINE ABOVE FOR DEPLOYMENT AND UNCOMMENT TOP MOST COMMENT
     */
});
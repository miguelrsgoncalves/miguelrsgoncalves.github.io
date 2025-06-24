document.addEventListener("DOMContentLoaded", function () {
    if(history.state) loadPage(history.state.page);
    else loadPage(tabsEnum.home);

    /**
     * DEBUG ONLY! LOADS A DIFFERENT INITIAL PAGE FOR EASIER DEBBUGING AND DEVELOPMENT
    */
    //loadPage("../project-pages/papers-please-the-short-film-spatial-audio-only-adaptation.html", "!!TESTING PAGE AUTO STARTING LOAD!! REMOVE BEFORE DEPLOYMENT!!");
    /**
     * COMMENT LINE ABOVE FOR DEPLOYMENT AND UNCOMMENT TOP MOST COMMENT
     */
});
window.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const path = params.get('path');

    if (path) {
      history.replaceState({}, '', '/' + path);
      loadPage(path);
    } else {
      loadPage(tabsEnum.home);
    }

    /**
     * DEBUG ONLY! LOADS A DIFFERENT INITIAL PAGE FOR EASIER DEBBUGING AND DEVELOPMENT
    */
    //loadPage("../project-pages/papers-please-the-short-film-spatial-audio-only-adaptation.html", "!!TESTING PAGE AUTO STARTING LOAD!! REMOVE BEFORE DEPLOYMENT!!");
    /**
     * COMMENT LINE ABOVE FOR DEPLOYMENT AND UNCOMMENT TOP MOST COMMENT
     */
});
document.addEventListener("DOMContentLoaded", function () {
    mainContent = document.getElementById("main-content");
    tabs = ([
        document.getElementById(tabsEnum.home),
        document.getElementById(tabsEnum.gameDev),
        document.getElementById(tabsEnum.projects),
        document.getElementById(tabsEnum.contacts)
    ]);
    pageTitle = document.getElementById('page-title');
    loadTab(tabsEnum.home);

    /**
     * DEBUG ONLY! LOAD A DIFFERENT INITIAL PAGE FOR EASIER DEBBUGING AND DEVELOPMENT
    */
    //loadPage("../project-pages/papers-please-the-short-film-spatial-audio-only-adaptation.html", "!!TESTING PAGE AUTO STARTING LOAD!! REMOVE BEFORE DEPLOYMENT!!");
    /**
     * COMMENT LINE ABOVE FOR DEPLOYMENT AND UNCOMMENT TOP MOST COMMENT
     */
});
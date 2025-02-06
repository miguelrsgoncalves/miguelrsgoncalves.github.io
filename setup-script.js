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
});
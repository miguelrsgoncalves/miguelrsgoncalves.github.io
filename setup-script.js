document.addEventListener("DOMContentLoaded", function () {
    mainContent = document.getElementById("main-content");
    tabs = ([
        document.getElementById(tabsEnum.home),
        document.getElementById(tabsEnum.gameDev),
        document.getElementById(tabsEnum.projects),
        document.getElementById(tabsEnum.contacts)
    ]);
    filterHeader = document.getElementById('filter-header');
    filterHeaderContent = document.getElementById('filter-content');
    loadTab(tabsEnum.home);

    const header = document.querySelector('header');
    const headerHeight = header.offsetHeight;
    document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
});
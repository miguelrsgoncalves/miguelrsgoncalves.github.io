document.addEventListener("DOMContentLoaded", function () {
    console.log("Why are you snooping around the console? There are no errors to be shown! I'm the best programmer alive! GO AWAY NOW!");
    mainContent = document.getElementById("main-content");
    tabs = ([
        document.getElementById(tabsEnum.home),
        document.getElementById(tabsEnum.gameDev),
        document.getElementById(tabsEnum.projects),
        document.getElementById(tabsEnum.contacts)
    ]);
    loadTab(tabsEnum.home);
});
document.addEventListener("DOMContentLoaded", function () {
    loadTab("home");
    tabs = ([
        document.getElementById("home"),
        document.getElementById("game-dev"),
        document.getElementById("other-projects"),
        document.getElementById("contacts")
    ]);
    mainContent = document.getElementById("main-content");
});
document.addEventListener("DOMContentLoaded", function () {
    mainContent = document.getElementById("main-content");
    tabs = ([
        document.getElementById("home"),
        document.getElementById("game-dev"),
        document.getElementById("other-projects"),
        document.getElementById("contacts")
    ]);
    loadTab("home");
});
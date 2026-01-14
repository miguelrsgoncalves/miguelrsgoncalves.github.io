window.addEventListener('DOMContentLoaded', () => {
    const path = new URLSearchParams(window.location.search).get('path') || ''

    if (path) {
        history.replaceState({}, '', '/' + path)
        loadPage(path)
    } else {
        //loadPage(tabsEnum.home)
        loadPage(tabsEnum.projects)
    }
})
const projectCards = (() => {
    var container = null
    var projectsData = []
    var renderIndex = 0
    var renderStep = 6
    var filter = null

    function init() {
        cleanupSignal.subscribe(cleanup)
    }

    async function loadProjectCards(containerId, dataSource) {
        try {
            const response = await fetch(dataSource)
            const projectsDataJSON = await response.json()
            
            const templateResponse = await fetch('assets/templates/project-card.html')
            const templateText = await templateResponse.text()
            const parser = new DOMParser()
            const templateDoc = parser.parseFromString(templateText, 'text/html')
            const template = templateDoc.getElementById('project-card').innerHTML
            
            container = document.getElementById(containerId)
            if (!container) {throw new Error(`Container with ID "${containerId}" not found.`)}

            projectsData = []

            projectsDataJSON.forEach(project => {
                const cardHTML = replacePlaceholders(template, project)
                projectsData.push({data: project, html: cardHTML})
            })
            
            renderProjects(false)

            window.addEventListener('scroll', handleScroll)
        } catch (error) {
            console.error('Error loading projects:', error)
        }
    }

    function renderProjects() {
        let renderCount = 0
        while (renderIndex < projectsData.length && renderCount < renderStep) {
            const project = projectsData[renderIndex]
            if(!filter || (
                filter.years.includes(project.data.year) &&
                filterContainsRoleCategory(filter.rolesCategories, project.data.roleCategory) &&
                filterContainsSoftware(filter.software, project.data.software) &&
                filterContainsMisc(filter.misc, project.data.misc)
            )) {
                container.insertAdjacentHTML('beforeend', project.html)
                renderCount++
            }
            renderIndex++
        }
    }

    function refresh(filters) {
        renderIndex = 0
        filter = filters
        container.innerHTML = ""
        renderProjects()
    }

    function replacePlaceholders(template, data) {
        return template.replace(/{{(.*?)}}/g, (match, p1) => {
            const key = p1.trim()
            if ((key === 'software' || key === 'roleCategory' || key === 'misc') && Array.isArray(data[key])) {
                return data[key].join(' | ')
            }
            return data[key] || ''
        })
    }

    function handleScroll() {
        if((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 50) {
            renderProjects(filter)
        }
    }

    function filterContainsRoleCategory(filterRoleCategory, projectDataRoleCategory) {
        return projectDataRoleCategory.some(element => filterRoleCategory.includes(element))
    }

    function filterContainsSoftware(filterSoftware, projectDataSoftware) {
        return projectDataSoftware.some(element => filterSoftware.includes(element))
    }

    function filterContainsMisc(filterMisc, projectDataMisc) {
        return projectDataMisc.some(element => filterMisc.includes(element))
    }

    function cleanup() {
        window.removeEventListener('scroll', handleScroll)
        container = null
        projectsData = []
        renderIndex = 0
        renderStep = 6
        filter = null
    }

    return { init, loadProjectCards, refresh }
})()
var dataSourcePath = undefined
var container = undefined
var projectsData = undefined
var renderIndex = undefined
var renderStep = undefined
var filter = undefined

function projectManagerInit(path) {
    cleanupSignal.subscribe(projectManagerCleanup)
    renderIndex = 0
    renderStep = 6
    if(dataSourcePath != path) {
        dataSourcePath = path
        projectsData = undefined
    }
}

async function getProjectData() {
    if(!Array.isArray(projectsData) || projectsData.length == 0) {
        projectsData = []
        try {
            const response = await fetch(dataSourcePath)
            const projectsDataJSON = await response.json()
            const templateResponse = await fetch('assets/templates/project-card.html')
            const templateText = await templateResponse.text()
            const parser = new DOMParser()
            const templateDoc = parser.parseFromString(templateText, 'text/html')
            const template = templateDoc.getElementById('project-card').innerHTML

            projectsDataJSON.forEach(project => {
                const cardHTML = replacePlaceholders(template, project)
                projectsData.push({data: project, html: cardHTML})
            })
        } catch (error) {
            console.error('Error loading projects:', error)
        }
    } else return
}

async function populateProjects(containerId) {
    window.removeEventListener("scroll", handleScroll)
    container = document.getElementById(containerId)
    await getProjectData()
    renderProjects()
    window.addEventListener("scroll", handleScroll)
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
    initScrollables()
}

function refreshProjects(filters) {
    renderIndex = 0
    filter = filters
    container.innerHTML = ""
    renderProjects()
}

function replacePlaceholders(template, data) {
    return template.replace(/{{(.*?)}}/g, (match, p1) => {
        const key = p1.trim()
        if ((key === 'software' || key === 'roleCategory' || key === 'misc') && Array.isArray(data[key])) {
            return data[key].map(item => `<span class="scrollable">${item}</span>`).join('')
        }
        return data[key] || ''
    })
}

function handleScroll() {
    if((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 50) {
        renderProjects()
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

function projectManagerCleanup() {
    container = undefined
    renderIndex = undefined
    renderStep = undefined
    filter = undefined
    window.removeEventListener('scroll', handleScroll)
}
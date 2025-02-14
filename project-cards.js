var container;
var projectsData = [];

async function loadProjects(containerId, dataSource) {
    try {
        const response = await fetch(dataSource);
        const projectsDataJSON = await response.json();
        
        const templateResponse = await fetch('assets/templates/project-card.html');
        const templateText = await templateResponse.text();
        const parser = new DOMParser();
        const templateDoc = parser.parseFromString(templateText, 'text/html');
        const template = templateDoc.getElementById('project-card').innerHTML;
        
        container = document.getElementById(containerId);
        if (!container) {throw new Error(`Container with ID "${containerId}" not found.`);}

        projectsData = [];

        projectsDataJSON.forEach(project => {
            const cardHTML = replacePlaceholders(template, project);
            projectsData.push({data: project, html: cardHTML});
        });
        
        renderProjects(false)
    } catch (error) {
        console.error('Error loading projects:', error);
    }
}

function renderProjects(filters) {
    container.innerHTML = "";
    projectsData.forEach(project => {
        if(!filters || (
            filters.years.includes(project.data.year) &&
            filterContainsRoleCategory(filters.rolesCategories, project.data.roleCategory) &&
            filterContainsSoftware(filters.software, project.data.software) &&
            filterContainsMisc(filters.misc, project.data.misc)
        )) container.insertAdjacentHTML('beforeend', project.html);
    })
}

function replacePlaceholders(template, data) {
    return template.replace(/{{(.*?)}}/g, (match, p1) => {
        const key = p1.trim();
        if ((key === 'software' || key === 'roleCategory' || key === 'misc') && Array.isArray(data[key])) {
            return data[key].join(' | ');
        }
        return data[key] || '';
    });
}

function filterContainsRoleCategory(filterRoleCategory, projectDataRoleCategory) {
    return projectDataRoleCategory.some(element => filterRoleCategory.includes(element));
}

function filterContainsSoftware(filterSoftware, projectDataSoftware) {
    return projectDataSoftware.some(element => filterSoftware.includes(element));
}

function filterContainsMisc(filterMisc, projectDataMisc) {
    return projectDataMisc.some(element => filterMisc.includes(element));
}
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
        
        const container = document.getElementById(containerId);
        if (!container) {throw new Error(`Container with ID "${containerId}" not found.`);}

        projectsData = [];

        projectsDataJSON.forEach(project => {
            const cardHTML = replacePlaceholders(template, project);
            projectsData.push({data: project, html: cardHTML});
        });
        
        renderProjects(containerId)
    } catch (error) {
        console.error('Error loading projects:', error);
    }
}

function renderProjects(containerId, yearFilter = 'all') {
    const container = document.getElementById(containerId);
    container.innerHTML = "";
    projectsData.forEach(project => {
        if(yearFilter == 'all') {container.insertAdjacentHTML('beforeend', project.html);}
        else {
            if(project.data.year == yearFilter) container.insertAdjacentHTML('beforeend', project.html);
        }
    })
}

function replacePlaceholders(template, data) {
    return template.replace(/{{(.*?)}}/g, (match, p1) => {
        const key = p1.trim();
        if ((key === 'software' || key === 'role/category') && Array.isArray(data[key])) {
            return data[key].join(' | ');
        }
        return data[key] || '';
    });
}
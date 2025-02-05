function replacePlaceholders(template, data) {
    return template.replace(/{{(.*?)}}/g, (match, p1) => {
        const key = p1.trim();
        if ((key === 'software' || key === 'role/category') && Array.isArray(data[key])) {
            return data[key].join(' | ');
        }
        return data[key] || '';
    });
}

async function addProjects(containerId, dataSource) {
    try {
        const response = await fetch(dataSource);
        const projectsData = await response.json();

        const templateResponse = await fetch('assets/templates/project-card.html');
        const templateText = await templateResponse.text();
        const parser = new DOMParser();
        const templateDoc = parser.parseFromString(templateText, 'text/html');
        const template = templateDoc.getElementById('project-card').innerHTML;

        const container = document.getElementById(containerId);
        if (!container) {
            throw new Error(`Container with ID "${containerId}" not found.`);
        }

        container.innerHTML = "";
        projectsData.forEach(project => {
            const cardHTML = replacePlaceholders(template, project);
            container.insertAdjacentHTML('beforeend', cardHTML);
        });
    } catch (error) {
        console.error('Error loading projects:', error);
    }
}
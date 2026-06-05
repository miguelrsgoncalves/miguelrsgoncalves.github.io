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

async function getProjectsData() {
  if(!Array.isArray(projectsData) || projectsData.length == 0) {
    projectsData = []
    try {
      const response = await fetch(dataSourcePath)
      const projectsDataJSON = await response.json()
      const templateResponse = await fetch('assets/components/project-card.html')
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
  await getProjectsData()
  if(typeof buildFilter === 'function') buildFilter(projectsData)
  renderProjects()
  window.addEventListener("scroll", handleScroll)
}

async function insertProjects() {
  await getProjectsData()
  document.querySelectorAll('[name="single-project-card"]').forEach(el => {
    const pageName = el.getAttribute("pageName")
    const projectCard = projectsData.find(element => element?.data?.pageName === pageName)
    el.replaceWith(document.createRange().createContextualFragment(projectCard.html))
  })
}

function matchesFilter(project, filter) {
  if (searchText) {
    const title = (project.data.title || '').toLowerCase();
    if (!title.includes(searchText)) {
      return false;
    }
  }

  if (!filter) return true;

  return Object.keys(filter).every(field => {
    const val = project.data[field];
    const selected = filter[field];
    if (Array.isArray(val)) {
      const effective = val.filter(Boolean);
      return (effective.length ? effective : ['']).some(v => selected.includes(v));
    }
    return selected.includes(String(val ?? ''));
  });
}

function renderProjects() {
  let renderCount = 0
  while(renderIndex < projectsData.length && renderCount < renderStep) {
    const project = projectsData[renderIndex]
    if(!filter || matchesFilter(project, filter)) {
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
    if((key === 'software' || key === 'category' || key === 'misc') && Array.isArray(data[key])) {
      return data[key].map(item => `<span class="h-scrollable">${item}</span>`).join('')
    }
    return data[key] || ''
  })
}

function handleScroll() {
  if((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 50) {
    renderProjects()
  }
}

function projectManagerCleanup() {
  container = undefined
  renderIndex = undefined
  renderStep = undefined
  filter = undefined
  window.removeEventListener('scroll', handleScroll)
}
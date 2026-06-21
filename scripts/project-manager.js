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
    const pageName = el.getAttribute("page-name")
    const projectCard = projectsData.find(element => element?.data?.["page-name"] === pageName)
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
  data.timeline = buildTimeline(data)
  return template.replace(/{{(.*?)}}/g, (match, p1) => {
    const key = p1.trim()
    if((key === 'software' || key === 'category' || key === 'misc') && Array.isArray(data[key])) {
      return data[key].map(item => `<span class="h-scrollable">${item}</span>`).join('')
    }
    return data[key] || ''
  })
}

function buildTimeline(data) {
  if (!data.dateStart || !data.dateEnd) return '';

  const start = new Date(data.dateStart).getTime();
  
  let endObject = new Date(data.dateEnd);
  if (data.dateEnd.toLowerCase() === 'present' || isNaN(endObject.getTime())) {
    endObject = new Date(); 
  }
  const end = endObject.getTime();
  
  const totalDurationMs = end - start;
  const displaydateEnd = formatDate(data.dateEnd);
  const displaydateStart = formatDate(data.dateStart);

  const totalDays = Math.max(0, Math.round(totalDurationMs / (1000 * 60 * 60 * 24)));

  if (totalDays <= 1) {
    return `
      <div class="timeline single-day">
        <div class="label">
          <span class="center-date">${displaydateStart}</span>
        </div>
      </div>
    `;
  }

  let durationText = getDateDuration(data.dateStart, data.dateEnd);

  let milestones = '';
  if (data.milestones && Array.isArray(data.milestones)) {
    data.milestones.forEach(milestone => {
      const milestoneTime = new Date(milestone.date).getTime();
      let percentage = ((milestoneTime - start) / totalDurationMs) * 100;
      percentage = Math.max(0, Math.min(100, percentage));

      milestones += `
        <div class="milestone-dot" style="left: ${percentage}%;">
          <div class="milestone-tooltip no-select">
            <div class="title">${milestone.title}</div>
            <div class="date">${formatDate(milestone.date)}</div>
            <div class="description">${milestone.description}</div>
          </div>
        </div>
      `;
    });
  }

  return `
    <div class="timeline">
      <div class="timeline-bar">
        ${milestones}
      </div>
      <div class="label">
        <div class="date-start">${displaydateStart}</div>
        <div class="duration">${durationText}</div>
        <div class="date-end">${displaydateEnd}</div>
      </div>
    </div>
  `;
}

function formatDate(dateString) {
  if (!dateString) return '';
  if (dateString.toLowerCase() === 'present') return 'Present';
  
  const dateObject = new Date(dateString);
  if (isNaN(dateObject.getTime())) return dateString;

  return dateObject.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

function getDateDuration(dateStartString, dateEndString) {
  const dateStart = new Date(dateStartString);
  let dateEnd = new Date(dateEndString);
  
  if (dateEndString.toLowerCase() === 'present' || isNaN(dateEnd.getTime())) {
    dateEnd = new Date();
  }

  let yearsDiff = dateEnd.getFullYear() - dateStart.getFullYear();
  let monthsDiff = dateEnd.getMonth() - dateStart.getMonth();
  let daysDiff = dateEnd.getDate() - dateStart.getDate();

  if (daysDiff < 0) {
    monthsDiff--;
    const previousMonth = new Date(dateEnd.getFullYear(), dateEnd.getMonth(), 0);
    daysDiff += previousMonth.getDate(); 
  }

  if (monthsDiff < 0) {
    yearsDiff--;
    monthsDiff += 12;
  }

  const totalDurationMs = dateEnd.getTime() - dateStart.getTime();
  const totalDays = Math.max(0, Math.round(totalDurationMs / (1000 * 60 * 60 * 24)));

  if (yearsDiff > 0) {
    let displayYears = yearsDiff;
    if (monthsDiff >= 6) displayYears++;
    return `${displayYears} ${displayYears === 1 ? 'year' : 'years'}`;
  } 
  
  if (monthsDiff > 0) {
    let displayMonths = monthsDiff;
    if (daysDiff >= 15) displayMonths++;
    
    if (displayMonths === 12) {
      return `1 year`;
    }
    return `${displayMonths} ${displayMonths === 1 ? 'month' : 'months'}`;
  } 
  
  return `${totalDays} ${totalDays === 1 ? 'day' : 'days'}`;
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
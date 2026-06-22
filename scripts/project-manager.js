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
      const templateResponse = await fetch("assets/components/project-card.html")
      const templateText = await templateResponse.text()
      const parser = new DOMParser()
      const templateDoc = parser.parseFromString(templateText, "text/html")
      const template = templateDoc.getElementById("project-card").innerHTML
      
      projectsDataJSON.forEach(project => {
        project.status = project.status || "Completed";

        if (project.startDate) {
          const date = new Date(project.startDate);
          project.startYear = isNaN(date.getTime()) ? "Unknown" : String(date.getFullYear());
        } else {
          project.endDate = ""
          project.startYear = "Unknown";
        }

        if (project.status === "Active") {
          project.endDate = "Present";
          project.endYear = "Present";
        } else if (project.endDate) {
          const date = new Date(project.endDate);
          project.endYear = isNaN(date.getTime()) ? "Unknown" : String(date.getFullYear());
        } else {
          project.endDate = "";
          project.endYear = "Unknown";
        }

        const cardHTML = replacePlaceholders(template, project)
        projectsData.push({data: project, html: cardHTML})
      })
    } catch (error) {
      console.error("Error loading projects:", error)
    }
  }
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
    const title = (project.data.title || "").toLowerCase();
    if (!title.includes(searchText)) return false;
  }

  if (!filter) return true;

  return Object.keys(filter).every(field => {
    const value = project.data[field];
    const selected = filter[field];
    
    if (Array.isArray(value)) {
      const effective = value.filter(Boolean);
      return (effective.length ? effective : ["None"]).some(v => selected.includes(v));
    }
    
    return selected.includes(String(value ?? "Unknown"));
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
  const start = data.startDate ? new Date(data.startDate).getTime() : NaN;
  let endObject = data.endDate ? new Date(data.endDate) : null;
  
  if (data.endDate && data.endDate.toLowerCase() === 'present') {
    endObject = new Date();
  }
  
  const end = (endObject && !isNaN(endObject.getTime())) ? endObject.getTime() : NaN;
  const hasValidTimelineRange = !isNaN(start) && !isNaN(end);
  
  const displayDateStart = !isNaN(start) ? formatDate(data.startDate) : 'Unknown';
  const displayDateEnd = data.status === 'active' ? 'Present' : (!isNaN(end) ? formatDate(data.endDate) : 'Unknown');
  
  let durationText = '';
  let milestones = '';

  if (hasValidTimelineRange) {
    durationText = getDateDuration(data.startDate, data.endDate);
    const totalDurationMs = end - start;

    if (data.milestones && Array.isArray(data.milestones) && totalDurationMs > 0) {
      data.milestones.forEach(milestone => {
        const milestoneTime = new Date(milestone.date).getTime();
        if (!isNaN(milestoneTime)) {
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
        }
      });
    }

    const totalDays = Math.max(0, Math.round(totalDurationMs / (1000 * 60 * 60 * 24)));
    if (totalDays <= 1) {
      return `
        <div class="timeline single-day">
          <div class="label">
            <span class="center-date">${displayDateStart}</span>
          </div>
        </div>
      `;
    }
  }

  return `
    <div class="timeline">
      <div class="timeline-bar">${milestones}</div>
      <div class="label">
        <div class="date-start">${displayDateStart}</div>
        ${durationText ? `<div class="duration">${durationText}</div>` : '<div class="duration empty"></div>'}
        <div class="date-end">${displayDateEnd}</div>
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
  const startDate = new Date(dateStartString);
  let endDate = new Date(dateEndString);
  
  if (dateEndString.toLowerCase() === 'present' || isNaN(endDate.getTime())) {
    endDate = new Date();
  }

  let yearsDiff = endDate.getFullYear() - startDate.getFullYear();
  let monthsDiff = endDate.getMonth() - startDate.getMonth();
  let daysDiff = endDate.getDate() - startDate.getDate();

  if (daysDiff < 0) {
    monthsDiff--;
    const previousMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 0);
    daysDiff += previousMonth.getDate(); 
  }

  if (monthsDiff < 0) {
    yearsDiff--;
    monthsDiff += 12;
  }

  const totalDurationMs = endDate.getTime() - startDate.getTime();
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
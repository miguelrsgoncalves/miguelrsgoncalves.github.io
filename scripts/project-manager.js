/*#region manager*/

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
    const pageName = el.getAttribute("id")
    const projectCard = projectsData.find(element => element?.data?.["id"] === pageName)
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
    if((key === 'tool' || key === 'category' || key === 'tag') && Array.isArray(data[key])) {
      return data[key].map(item => `<span class="h-scrollable">${item}</span>`).join('')
    }
    return data[key] || ''
  })
}

function buildTimeline(data) {
  const start = data.startDate ? new Date(data.startDate).getTime() : NaN;
  
  let endObject = null;
  let isPresent = false;

  if (
    (data.endDate && data.endDate.toLowerCase() === "present")
    || (!data.endDate && data.status && (data.status.toLowerCase() === "active" || data.status.toLowerCase() === "maintenance"))
  ) {
    endObject = new Date();
    isPresent = true;
  } 
  else if (data.endDate) {
    endObject = new Date(data.endDate);
  }
  
  const end = endObject ? endObject.getTime() : NaN;
  const hasValidTimelineRange = !isNaN(start) && !isNaN(end);
  
  const displayDateStart = !isNaN(start) ? formatDate(data.startDate) : 'Unknown';
  const displayDateEnd = isPresent ? 'Present' : (!isNaN(end) ? formatDate(data.endDate) : 'Unknown');
  
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

/*#endregion*/

/*#region filter*/

var filterConfig = null
var filterGroups = {}
var searchText = ""

function filterInit(fields) {
  filterConfig = fields
  cleanupSignal.subscribe(filterCleanup)
  hasFilterHeader = true
}

function buildFilter(allProjectsData) {
  if(!filterConfig) return
  const dropdown = document.getElementById("filter-panel")
  if(!dropdown) return

  const rawData = allProjectsData.map(p => p.data ?? p)
  const uniqueValues = {}

  filterConfig.forEach(field => {
    const values = new Set()
    rawData.forEach(project => {
      const val = project[field]
      if(Array.isArray(val)) {
        const nonEmpty = val.filter(Boolean)
        nonEmpty.length ? nonEmpty.forEach(v => values.add(v)) : values.add("None")
      } else if(val != null && val !== "") {
        values.add(String(val))
      } else {
        values.add("Unknown")
      }
    })

    uniqueValues[field] = [...values].sort((a, b) => {
      if (field === "startYear" || field === "endYear") {
        if (a === "Present") return -1;
        if (b === "Present") return 1;
        if (a === "Unknown") return 1;
        if (b === "Unknown") return -1;
        return b.localeCompare(a); 
      }
      return a.localeCompare(b);
    })
  })

  filterGroups = {}
  filterConfig.forEach(field => {
    filterGroups[field] = { all: `all-${field}`, checkboxes: `.${field}-checkbox` }
  })

  dropdown.innerHTML = filterConfig.map(field => {
    const checkboxes = uniqueValues[field].map(v => `
      <div class="panel-checkbox no-select">
        <input name="${v}" type="checkbox" class="${field}-checkbox clickable" checked onchange="updateGroup('${field}')">
        <label class="clickable" onclick="toggleOnly('${field}', this)">${v}</label>
      </div>`).join('')
      
    const titleText = field.replace(/([A-Z])/g, ' $1').trim().capitalize();

    return `
      <div class="panel-column">
        <h4 class="panel-title no-select">${titleText}</h4>
        <div class="panel-checkbox">
          <input type="checkbox" id="all-${field}" class="clickable" checked onchange="toggleAll('${field}', true)">
          <label class="clickable no-select" onclick="toggleAll('${field}', false)">All</label>
        </div>
        <div class="panel-indent-group">${checkboxes}</div>
      </div>`
  }).join('')
}

function getSelected(group) {
  const selected = []
  document.querySelectorAll(filterGroups[group].checkboxes).forEach(el => {
    if(el.checked) selected.push(el.name === "None" ? "" : el.name)
  })
  return selected
}

function toggleDropdown(containerId) {
  document.getElementById("filter-panel").classList.toggle("active")
}

function closeDropdown() {
  document.getElementById("filter-panel").classList.remove("active")
}

function toggleAll(group, isCheckbox) {
  const allBox = document.getElementById(filterGroups[group].all)
  if(!isCheckbox) allBox.checked = !allBox.checked
  document.querySelectorAll(filterGroups[group].checkboxes).forEach(cb => cb.checked = allBox.checked)
  filterProjects()
}

function updateGroup(group) {
  const { all, checkboxes } = filterGroups[group]
  const allBox = document.getElementById(all)
  allBox.checked = Array.from(document.querySelectorAll(checkboxes)).every(cb => cb.checked)
  filterProjects()
}

function toggleOnly(group, label) {
  document.getElementById(filterGroups[group].all).checked = false
  document.querySelectorAll(filterGroups[group].checkboxes).forEach(cb => {
    cb.checked = (cb.name === label.innerHTML)
  })
  filterProjects()
}

function filterProjects() {
  const filters = {}
  Object.keys(filterGroups).forEach(field => filters[field] = getSelected(field))
  refreshProjects(filters)
}

function resetFilter() {
  Object.keys(filterGroups).forEach(group => {
    document.getElementById(filterGroups[group].all).checked = true
    toggleAll(group, true)
  })
  searchText = ""
  refreshProjects(false)
}

function handleProjectSearchInput(value) {
  searchText = value.toLowerCase().trim();
  filterProjects();
}

function filterCleanup() {
  filterGroups = {}
  searchText = ""
  hasFilterHeader = false
}

/*#endregion*/
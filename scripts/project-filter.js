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
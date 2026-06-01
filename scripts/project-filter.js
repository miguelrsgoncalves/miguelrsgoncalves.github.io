var filterConfig = null
var filterGroups = {}

const FILTER_LABELS = {
  year: 'Year',
  roleCategory: 'Category',
  software: 'Software',
  misc: 'Misc',
}

function filterInit(fields) {
  filterConfig = fields
  cleanupSignal.subscribe(filterCleanup)
}

function buildFilter(allProjectsData) {
  if(!filterConfig) return
  const dropdown = document.getElementById('filter-dropdown')
  if(!dropdown) return

  const rawData = allProjectsData.map(p => p.data ?? p)

  const uniqueValues = {}
  filterConfig.forEach(field => {
    const values = new Set()
    rawData.forEach(project => {
      const val = project[field]
      if(Array.isArray(val)) {
        const nonEmpty = val.filter(Boolean)
        nonEmpty.length ? nonEmpty.forEach(v => values.add(v)) : values.add('')
      } else if(val != null) {
        values.add(String(val))
      }
    })
    uniqueValues[field] = [...values].sort((a, b) =>
      field === 'year' ? b.localeCompare(a) : a.localeCompare(b)
    )
  })

  filterGroups = {}
  filterConfig.forEach(field => {
    filterGroups[field] = { all: `all-${field}`, checkboxes: `.${field}-checkbox` }
  })

  dropdown.innerHTML = filterConfig.map(field => {
    const checkboxes = uniqueValues[field].map(v => `
      <div class="filter-checkbox">
        <input name="${v || 'None'}" type="checkbox" class="${field}-checkbox clickable" checked onchange="updateGroup('${field}')">
        <label class="clickable" onclick="toggleOnly('${field}', this)">${v || 'None'}</label>
      </div>`).join('')
    return `
      <div class="filter-column">
        <h4 class="filter-title">${FILTER_LABELS[field] ?? field}</h4>
        <div class="filter-checkbox">
          <input type="checkbox" id="all-${field}" class="clickable" checked onchange="toggleAll('${field}', true)">
          <label class="clickable" onclick="toggleAll('${field}', false)">All</label>
        </div>
        <div class="indented-checkboxes">${checkboxes}</div>
      </div>`
  }).join('')
}

function getSelected(group) {
  const selected = []
  document.querySelectorAll(filterGroups[group].checkboxes).forEach(el => {
    if(el.checked) selected.push(el.name === 'None' ? '' : el.name)
  })
  return selected
}

function toggleDropdown(containerId) {
  document.getElementById('filter-dropdown').classList.toggle('active')
}

function closeDropdown() {
  document.getElementById('filter-dropdown').classList.remove('active')
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
  refreshProjects(false)
}

function filterCleanup() {
  filterGroups = {}
}
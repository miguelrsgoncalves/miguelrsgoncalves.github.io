var container;
var filterGroups = {
  years: {
    all: "all-years",
    checkboxes: ".year-checkbox",
  },
  rolesCategories: {
    all: "all-roles-categories",
    checkboxes: ".roles-categories-checkbox",
  },
  software: {
    all: "all-software",
    checkboxes: ".software-checkbox",
  },
  misc: {
    all: "all-misc",
    checkboxes: ".misc-checkbox",
  }
};

function toggleFilterDropdown(containerId) {
  const filterDropdown = document.getElementById("filter-dropdown");
  filterDropdown.classList.toggle("active");

  if (filterDropdown.classList.contains("active")) {
    container = document.getElementById(containerId);
  }
}

function closeFilterDropdown() {
  document.getElementById("filter-dropdown").classList.remove("active");
}

/* ------------------ GENERIC HELPERS ------------------ */

/**
 * Get selected values for a filter groupZ
 * @param {*} group 
 * @returns 
 */
function getSelected(group) {
  const { checkboxes } = filterGroups[group];
  const selected = [];
  document.querySelectorAll(checkboxes).forEach(el => {
    if (el.checked) {
      if (el.name === "None") selected.push("");
      else selected.push(el.name);
    }
  });
  return selected;
}

/**
 * Toggle all checkboxes in a group
 * @param {*} group 
 * @param {*} isCheckbox 
 */
function toggleAll(group, isCheckbox) {
  const allBox = document.getElementById(filterGroups[group].all);
  if (!isCheckbox) allBox.checked = !allBox.checked;

  document.querySelectorAll(filterGroups[group].checkboxes).forEach(cb => {
    cb.checked = allBox.checked;
  });

  filterProjects();
}

/**
 * Update "All" checkbox when individual boxes change
 * @param {*} group 
 */
function updateGroup(group) {
  const { all, checkboxes } = filterGroups[group];
  const allBox = document.getElementById(all);
  const boxes = Array.from(document.querySelectorAll(checkboxes));

  allBox.checked = boxes.every(cb => cb.checked);
  filterProjects();
}

/**
 * Select only one checkbox in a group
 * @param {*} group 
 * @param {*} label 
 */
function toggleOnly(group, label) {
  const { all, checkboxes } = filterGroups[group];
  const allBox = document.getElementById(all);
  allBox.checked = false;

  document.querySelectorAll(checkboxes).forEach(cb => {
    cb.checked = (cb.name === label.innerHTML);
  });

  filterProjects();
}

/* ------------------ FILTERING ------------------ */

function filterProjects() {
  const filters = {
    years: getSelected("years"),
    rolesCategories: getSelected("rolesCategories"),
    software: getSelected("software"),
    misc: getSelected("misc"),
  };
  renderProjects(filters);
}

function resetFilters() {
  Object.keys(filterGroups).forEach(group => {
    const allBox = document.getElementById(filterGroups[group].all);
    allBox.checked = true;
    toggleAll(group, true);
  });
  renderProjects(false);
}

var container;
var allYearsCheckbox;
var yearCheckboxes;
var allRolesCategoriesCheckbox;
var rolesCategoriesCheckboxes;
var allSoftwareCheckbox;
var softwareCheckboxes;

function toggleFilterDropdown(containerId) {
    const filterDropdown = document.getElementById('filter-dropdown');
    filterDropdown.classList.toggle('active');

    if (filterDropdown.classList.contains('active')) {
        container = document.getElementById(containerId);
        allYearsCheckbox = document.getElementById('all-years');
        yearCheckboxes = document.querySelectorAll('.year-checkbox');
        allRolesCategoriesCheckbox = document.getElementById('all-roles-categories');
        rolesCategoriesCheckboxes = document.querySelectorAll('.roles-categories-checkbox');
        allSoftwareCheckbox = document.getElementById('all-software');
        softwareCheckboxes = document.querySelectorAll('.software-checkbox');
    }
}

function closeFilterDropdown() {
    const filterDropdown = document.getElementById('filter-dropdown');
    filterDropdown.classList.remove('active');
}
  
function filterProjects() {
    var filters = {
        years: getSelectedYears(),
        rolesCategories: getSelectedRolesCategories(),
        software: getSelectedSoftware()
    };
    renderProjects(filters);
}

function resetFilters() {
    if(!allYearsCheckbox || !allRolesCategoriesCheckbox || !allSoftwareCheckbox) return;
    
    allYearsCheckbox.checked = true;
    allRolesCategoriesCheckbox.checked = true;
    allSoftwareCheckbox.checked = true;
    toggleAllYears(true);
    toggleAllRolesCategories(true);
    toggleAllSoftware(true);
    renderProjects(false);
}
  
function getSelectedYears() {
    var selectedYears = [];
    yearCheckboxes.forEach(element => {
        if(element.checked  ) selectedYears.push(element.name);
    });
    return selectedYears;
}

function getSelectedRolesCategories() {
    var selectedRolesCategories = [];
    rolesCategoriesCheckboxes.forEach(element => {
        if(element.checked  ) selectedRolesCategories.push(element.name);
    });
    return selectedRolesCategories;
}

function getSelectedSoftware() {
    var selectedSoftware = [];
    softwareCheckboxes.forEach(element => {
        if(element.checked  ) selectedSoftware.push(element.name);
    });
    return selectedSoftware;
}

function toggleAllYears(isCheckbox) {
    if(!isCheckbox) allYearsCheckbox.checked = !allYearsCheckbox.checked;
    yearCheckboxes.forEach(checkbox => {
        checkbox.checked = allYearsCheckbox.checked;
    });
    filterProjects();
}

function updateYearFilters() {
    if (Array.from(yearCheckboxes).some(checkbox => !checkbox.checked)) {
        allYearsCheckbox.checked = false;
    } else {
        allYearsCheckbox.checked = true;
    }
    filterProjects();
}

function toggleOnlyYear(label) {
    allYearsCheckbox.checked = false;
    yearCheckboxes.forEach(element => {
        if(element.name != label.innerHTML) element.checked = false;
        else element.checked = true;
    });
    filterProjects();
}

function toggleAllRolesCategories(isCheckbox) {
    if(!isCheckbox) allRolesCategoriesCheckbox.checked = !allRolesCategoriesCheckbox.checked;
    rolesCategoriesCheckboxes.forEach(checkbox => {
        checkbox.checked = allRolesCategoriesCheckbox.checked;
    });
    filterProjects();
}

function updateRolesCategoriesFilters() {
    if (Array.from(rolesCategoriesCheckboxes).some(checkbox => !checkbox.checked)) {
        allRolesCategoriesCheckbox.checked = false;
    } else {
        allRolesCategoriesCheckbox.checked = true;
    }
    filterProjects();
}

function toggleOnlyRolesCategories(label) {
    allRolesCategoriesCheckbox.checked = false;
    rolesCategoriesCheckboxes.forEach(element => {
        if(element.name != label.innerHTML) element.checked = false;
        else element.checked = true;
    });
    filterProjects();
}

function toggleAllSoftware(isCheckbox) {
    if(!isCheckbox) allSoftwareCheckbox.checked = !allSoftwareCheckbox.checked;
    softwareCheckboxes.forEach(checkbox => {
        checkbox.checked = allSoftwareCheckbox.checked;
    });
    filterProjects();
}

function updateSoftwareFilters() {
    if (Array.from(softwareCheckboxes).some(checkbox => !checkbox.checked)) {
        allSoftwareCheckbox.checked = false;
    } else {
        allSoftwareCheckbox.checked = true;
    }
    filterProjects();
}

function toggleOnlySoftware(label) {
    allSoftwareCheckbox.checked = false;
    softwareCheckboxes.forEach(element => {
        if(element.name != label.innerHTML) element.checked = false;
        else element.checked = true;
    });
    filterProjects();
}
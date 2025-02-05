var container;
var allYearsCheckbox;
var yearCheckboxes;
var allRolesCategoriesCheckbox;
var rolesCategoriesCheckboxes;

function toggleFilterDropdown(containerId) {
    const filterDropdown = document.getElementById('filter-dropdown');
    filterDropdown.classList.toggle('active');

    if (filterDropdown.classList.contains('active')) {
        container = document.getElementById(containerId);
        allYearsCheckbox = document.getElementById('all-years');
        yearCheckboxes = document.querySelectorAll('.year-checkbox');
        allRolesCategoriesCheckbox = document.getElementById('all-roles-categories');
        rolesCategoriesCheckboxes = document.querySelectorAll('.roles-categories-checkbox');
    }
}
  
function filterProjects() {
    var filters = {
        years: getSelectedYears(),
        rolesCategories: getSelectedRolesCategories()
    };
    renderProjects(filters);
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

function toggleAllYears(allYearsCheckbox) {
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

function toggleAllRolesCategories(allRolesCategoriesCheckbox) {
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
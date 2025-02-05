var container;
var allYearsCheckbox;
var yearCheckboxes;

function toggleFilterDropdown(containerId) {
    const filterDropdown = document.getElementById('filter-dropdown');
    filterDropdown.classList.toggle('active');

    if(filterDropdown.classList.contains('active')) {
        container = document.getElementById(containerId);
        allYearsCheckbox = document.getElementById('all-years');
        yearCheckboxes = document.querySelectorAll('.filter-option input[type="checkbox"]:not(#all-years)');
    }
  }
  
  function toggleAllYears(allYearsCheckbox) {
    yearCheckboxes.forEach(checkbox => {
      checkbox.checked = allYearsCheckbox.checked;
    });
    filterProjectsByYear(container);
  }
  
  function updateYearFilters() {
    if (Array.from(yearCheckboxes).some(checkbox => !checkbox.checked)) {
        allYearsCheckbox.checked = false;
    } else {
        allYearsCheckbox.checked = true;
    }

    filterProjectsByYear(container);
  }
  
  function filterProjectsByYear() {
    const selectedYears = getSelectedYears();
    renderProjects(selectedYears);
  }

  function getSelectedYears() {
    var selectedYears = [];
    yearCheckboxes.forEach(element => {
        if(element.checked  ) selectedYears.push(element.name);
    });
    return selectedYears;
  }
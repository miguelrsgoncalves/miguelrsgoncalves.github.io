function loadEmbeddedProject(startButton, container, embeddedProjectHTML, loadingScreen) {
  const embeddedProjectContent = document.getElementById(container);
  const loadingScreenElement = document.getElementById(loadingScreen);

  if(startButton.innerHTML == 'Start') {
    loadingScreenElement.style.visibility = 'visible';
    fetch(embeddedProjectHTML)
    .then(response => response.text())
    .then(data => {
      startButton.innerHTML = "Stop"
      embeddedProjectContent.innerHTML = data;
    })
    .catch(error => {
      loadingScreenElement.style.visibility = 'hidden';
      console.error("Error loading embedded project:", error);
      embeddedProjectContent.innerHTML = `<p>Error loading project. Please try again.</p>`;
    });
  } else {
    loadingScreenElement.style.visibility = 'hidden';
    startButton.innerHTML = "Start"
    embeddedProjectContent.innerHTML = "";
  }
}

function restartEmbeddedProject(startButton, container, embeddedProjectHTML, loadingScreen) {
  const embeddedProjectContent = document.getElementById(container);
  const startButtonElement = document.getElementById(startButton);
  const loadingScreenElement = document.getElementById(loadingScreen);

  if(startButtonElement.innerHTML == 'Stop') {
    loadingScreenElement.style.visibility = 'visible';
    fetch(embeddedProjectHTML)
    .then(response => response.text())
    .then(data => {
      embeddedProjectContent.innerHTML = data;
    })
    .catch(error => {
      loadingScreenElement.style.visibility = 'hidden';
      console.error("Error loading embedded project:", error);
      embeddedProjectContent.innerHTML = `<p>Error loading project. Please try again.</p>`;
    });
  }
}
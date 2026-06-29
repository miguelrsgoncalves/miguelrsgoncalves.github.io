function loadEmbeddedProject(frameID, project, loadingScreenID) {
  const frame = document.getElementById(frameID);
  const loader = document.getElementById(loadingScreenID);
  
  const isRunning = frame.hasAttribute("running");

  if (!isRunning) {
    loader.style.visibility = 'visible';
    
    fetch(project)
      .then(r => r.text())
      .then(data => {
        frame.setAttribute("running", "true");
        frame.replaceChildren(document.createRange().createContextualFragment(data));
      });
  } else {
    loader.style.visibility = 'hidden';
    frame.removeAttribute("running");
    frame.replaceChildren();
  }
}

function restartEmbeddedProject(frameID, project, loadingScreenID) {
  const frame = document.getElementById(frameID);
  const isRunning = frame.hasAttribute("running");

  if (isRunning) {
    frame.removeAttribute("running");
    frame.replaceChildren();
    loadEmbeddedProject(frameID, project, loadingScreenID);
  }
}
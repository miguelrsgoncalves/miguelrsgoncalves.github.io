//#region control-bar

function toggleControlPanel(source, panelName) {
  const group = source.closest(".control-group");
  
  if (!group) {
    console.error("toggleControlPanel needs a parent control-group in order to work.");
    return;
  }

  const bar = group.querySelector(".control-bar");
  const panels = group.querySelectorAll(".control-panel");
  
  const targetPanel = Array.from(panels).find(panel => 
    panel.dataset.panelName === panelName
  );
  
  const isAlreadyActive = targetPanel?.classList.contains('active');

  panels.forEach(panel => panel.classList.remove('active'));

  if (targetPanel && !isAlreadyActive) {
    targetPanel.classList.add('active');
    bar.classList.add('active');
  } else {
    bar.classList.remove('active');
  }
}

//#endregion
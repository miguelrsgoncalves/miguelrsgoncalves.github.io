//#region control-bar

function toggleControlGroupPanel(source, panelName) {
  const group = source.closest('.control-group');
  
  if (!group) {
    console.error('toggleGroupPanel needs a .control-group wrapper to work properly.');
    return;
  }

  const controlBar = group.querySelector('.control-bar');
  const targetPanel = group.querySelector(`[panel-data="${panelName}"]`);
  const isAlreadyActive = targetPanel.querySelector('.active')

  group.querySelectorAll('.control-panel').forEach(panel => {
    panel.classList.remove('active');
  });

  if (targetPanel) {
    targetPanel.classList.add('active');
    controlBar.classList.add('active');
  } else {
    controlBar.classList.remove('active');
  }
}

//#endregion
//#region control-bar

function toggleControlGroupPanel(button, panelName) {
  const group = button.closest('.control-group');
  
  if (!group) {
    console.error('toggleGroupPanel needs a .control-group wrapper to work properly.');
    return;
  }

  const targetPanel = group.querySelector(`[panel-data="${panelName}"]`);
  const isCurrentlyActive = button.classList.contains('active');

  group.querySelectorAll('.control-panel').forEach(panel => {
    panel.classList.remove('active');
  });

  if (!isCurrentlyActive && targetPanel) {
    targetPanel.classList.add('active');
  }
}

//#endregion
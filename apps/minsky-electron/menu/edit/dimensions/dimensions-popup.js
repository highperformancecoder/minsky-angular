const electron = require('electron');
const { ipcRenderer } = electron;

document.getElementById('submitBtn').addEventListener('click', () => {
  ipcRenderer.send('global-menu-popup:cancel');
});
document.getElementById('cancelBtn').addEventListener('click', () => {
  ipcRenderer.send('global-menu-popup:cancel');
});

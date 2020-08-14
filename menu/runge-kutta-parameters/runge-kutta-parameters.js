const electron = require('electron');
const { ipcRenderer } = electron;
document.querySelector('.cancel-btn').addEventListener('click', () => {
    ipcRenderer.send('global-menu-popup:cancel');
})
const electron = require('electron')
const { ipcRenderer } = electron
document.getElementById('createVariableOk').addEventListener('click', () => {
	console.log('button clicked')
	ipcRenderer.send('create-variable:ok', '')
})
document.querySelector('.cancel-btn').addEventListener('click', () => {
	ipcRenderer.send('global-menu-popup:cancel')
})

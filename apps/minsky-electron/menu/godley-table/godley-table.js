const electron = require('electron')
const { ipcRenderer } = electron
document.getElementById('godleyTableOk').addEventListener('click', () => {
	console.log('button clicked')
	ipcRenderer.send('godley-table:ok', '')
})
document.querySelector('.cancel-btn').addEventListener('click', () => {
	ipcRenderer.send('global-menu-popup:cancel')
})

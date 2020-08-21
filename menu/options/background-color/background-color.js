const electron = require('electron')
const storage = require('electron-json-storage')

storage.setDataPath((electron.app || electron.remote.app).getPath('userData'))
const { ipcRenderer } = electron
document.getElementById('backgroundOk').addEventListener('click', () => {
	var selected_color_code = $('#color-picker').spectrum('get')

	data = {
		color: selected_color_code.toHexString(),
	}
	ipcRenderer.send('background-color:ok', data)
})
document.querySelector('.cancel-btn').addEventListener('click', () => {
	ipcRenderer.send('global-menu-popup:cancel')
})

storage.get('backgroundColor', function (error, data) {
	if (error) throw error
	if (data.color !== undefined) {
		document.getElementById('color-picker').value = data.color
	}
})
$('#color-picker').spectrum({
	type: 'flat',
	showInput: false,
	allowEmpty: 'false',
	showButtons: false,
})

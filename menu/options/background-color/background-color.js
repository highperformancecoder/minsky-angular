const electron = require('electron');
const { ipcRenderer } = electron;
document.getElementById("backgroundOk").addEventListener('click', () => {
    var selected_color_code = document.getElementById("myColor").value;
    data = {
        color: selected_color_code
    }
    ipcRenderer.send('background-color:ok', data);

})
document.getElementById("backgroundCancel").addEventListener('click', () => {
    ipcRenderer.send('background-color:cancel', "");
})
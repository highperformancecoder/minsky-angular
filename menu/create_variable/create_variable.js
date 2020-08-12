const electron = require('electron');
const { ipcRenderer } = electron;
document.getElementById("createVariableOk").addEventListener('click', () => {
    console.log("button clicked");
    ipcRenderer.send('create_variable:ok', "");
})
document.getElementById("createVariableCancel").addEventListener('click', () => {
    ipcRenderer.send('create_variable:cancel', "");
})
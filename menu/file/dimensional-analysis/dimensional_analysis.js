const electron = require('electron');
const { ipcRenderer } = electron;
document.querySelector("button").addEventListener('click',()=>{
    ipcRenderer.send('about:close', "");
})
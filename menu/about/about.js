const electron = require('electron');
const { ipcRenderer } = electron;
document.querySelector("button").addEventListener('click',()=>{
    console.log("button clicked");
    ipcRenderer.send('about:close', "");
})
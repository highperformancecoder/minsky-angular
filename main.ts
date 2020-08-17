import { app, BrowserWindow, screen, Menu } from 'electron';
import * as path from 'path';
import * as url from 'url';
import {template} from './top-menu';
const storage = require('electron-json-storage');

export let win: BrowserWindow = null;
let storageBackgroundColor;
const args = process.argv.slice(1),
  serve = args.some(val => val === '--serve');

function createWindow(): BrowserWindow {

  storage.get('backgroundColor', function(error, data) {
    if (error) throw error;
    storageBackgroundColor = data.color || "#c1c1c1";
    win = prepareBrowserWindow(storageBackgroundColor);
  });

  return win;
}

function prepareBrowserWindow(color){
  color = color || "#c1c1c1";
  const electronScreen = screen;
  const size = electronScreen.getPrimaryDisplay().workAreaSize;
  win = new BrowserWindow({
    x: 0,
    y: 0,
    width: size.width,
    height: size.height,
    transparent: true,
    webPreferences: {
      nodeIntegration: true,
      affinity: "window",
      allowRunningInsecureContent: (serve) ? true : false,
    },
    icon: __dirname + '/Icon/favicon.png'
  });
  win.webContents.openDevTools();
 win.setBackgroundColor(color);
  if (serve) {
    require('electron-reload')(__dirname, {
      electron: require(`${__dirname}/node_modules/electron`)
    });
    win.loadURL('http://localhost:4200');

  } else {
    win.loadURL(url.format({
      pathname: path.join(__dirname, 'dist/index.html'),
      protocol: 'file:',
      slashes: true
    }));
  }

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });
  return win;
}

try {

  app.allowRendererProcessReuse = true;

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  // Added 400 ms to fix the black background issue while using transparent window. More detais at https://github.com/electron/electron/issues/15947
  app.on('ready', () => {
    const menu = template
    Menu.setApplicationMenu(menu)
    setTimeout(createWindow, 400)
  });

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow();
    }
  });

} catch (e) {
  // Catch Error
  // throw e;
}

export function setStorageBackgroundColor(color){
  storageBackgroundColor = color;
}
export function getStorageBackgroundColor(){
  return storageBackgroundColor;
}

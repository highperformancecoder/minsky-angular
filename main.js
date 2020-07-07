const { app, BrowserWindow, Menu, MenuItem } = require('electron')
const path = require('path');
const template = require(path.join(__dirname, './electron1/constants/top-menu'));
// const template = [
//   {
//     label: 'Menu',
//     submenu: [
//       {
//         label: 'About Minsky',
//       },
//       {
//         label: 'Upgrade'
//       },
//       {
//         label: 'New System'
//       },
//       {
//         label: 'Open'
//       },
//       {
//         label: 'Recent Files',
//         submenu: [
//           {
//             label: 'TestFile'
//           }
//         ]
//       },
//       {
//         label: 'Library'
//       },
//       {
//         label: 'Save'
//       },
//       {
//         label: 'SaveAs'
//       },
//       {
//         label: 'Insert File as Group'
//       },
//       {
//         label: 'Dimensional Analysis'
//       },
//       {
//         label: 'Export Canvas'
//       },
//       {
//         label: 'Export Plots',
//         submenu: [
//           {
//             label: 'test'
//           }
//         ]
//       },
//       {
//         label: 'Log simulation'
//       },
//       {
//         label: 'Recording'
//       },
//       {
//         label: 'Replay recording'
//       },
//       {
//         label: 'Quit'
//       },
//       {
//         type: 'separator'
//       },
//       {
//         label: 'Debugging Use'
//       }
//     ]
//   },
//   {
//      label: 'Edit',
//      submenu: [
//         {
//            role: 'undo'
//         },
//         {
//            role: 'redo'
//         },
//         {
//            type: 'separator'
//         },
//         {
//            role: 'cut'
//         },
//         {
//            role: 'copy'
//         },
//         {
//            role: 'paste'
//         }
//      ]
//   },
  
//   {
//      label: 'View',
//      submenu: [
//         {
//            role: 'reload'
//         },
//         {
//            role: 'toggledevtools'
//         },
//         {
//            type: 'separator'
//         },
//         {
//            role: 'resetzoom'
//         },
//         {
//            role: 'zoomin'
//         },
//         {
//            role: 'zoomout'
//         },
//         {
//            type: 'separator'
//         },
//         {
//            role: 'togglefullscreen'
//         }
//      ]
//   },
  
//   {
//      role: 'window',
//      submenu: [
//         {
//            role: 'minimize'
//         },
//         {
//            role: 'close'
//         }
//      ]
//   },
  
//   {
//      role: 'help',
//      submenu: [
//         {
//            label: 'Learn More'
//         }
//      ]
//   }
// ]
let win;

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({
    width: 600, 
    height: 600,
    backgroundColor: '#ffffff'
  })


  win.loadURL(`file://${__dirname}/dist/angular-minsky/index.html`)

  //// uncomment below to open the DevTools.
  // win.webContents.openDevTools()

  // Event when the window is closed.
  win.on('closed', function () {
    win = null
  })
}
const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)
// Create window on electron intialization
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {

  // On macOS specific close process
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // macOS specific close process
  if (win === null) {
    createWindow()
  }
})


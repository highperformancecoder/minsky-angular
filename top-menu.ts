import { Menu, BrowserWindow, ipcMain,shell } from 'electron';
let aboutWin: BrowserWindow;

ipcMain.on('about:close', (event) => {
  aboutWin.close();
});

import { win } from './main';

export const template = Menu.buildFromTemplate([
  {
    label: 'File',
    submenu: [
      {
        label: 'About Minsky',
        //It will open a child window when about menu is clicked.
        click() {
          aboutWin = new BrowserWindow(
            {
              width: 420, height: 440,
              webPreferences: { nodeIntegration: true },
              resizable: false,
              minimizable: false,
              parent:win,
              modal:true,
              show:false,
              title: "About Minsky"
            })
          //setting menu for child window
          aboutWin.setMenu(null);
          // Load a remote URL
          aboutWin.loadURL(`file://${__dirname}/menu/about/about.html`)
          // aboutWin.webContents.openDevTools();

          //The window will show when it is ready
          aboutWin.once('ready-to-show',()=>{
             aboutWin.show();
          });

          aboutWin.on('closed', function () {
            aboutWin = null;
        });

        }
      },
      {
        label: 'Upgrade',
        click() {
          shell.openExternal('https://www.patreon.com/hpcoder');
      }
      },
      {
        label: 'New System',
        
      },
      {
        label: 'Open'
      },
      {
        label: 'Recent Files',
        submenu: [
          {
            label: 'TestFile'
          }
        ]
      },
      {
        label: 'Library',
        click () {
            shell.openExternal('https://github.com/highperformancecoder/minsky-models');
        }
      },
      {
        label: 'Save'
      },
      {
        label: 'SaveAs'
      },
      {
        label: 'Insert File as Group'
      },
      {
        label: 'Dimensional Analysis'
      },
      {
        label: 'Export Canvas'
      },
      {
        label: 'Export Plots',
        submenu: [
          {
            label: 'as SVG'
          },
          {
            label: 'as CSV'
          }
        ]
      },
      {
        label: 'Log simulation'
      },
      {
        label: 'Recording'
      },
      {
        label: 'Replay recording'
      },
      {
        label: 'Quit'
      },
      {
        type: 'separator'
      },
      {
        label: 'Debugging Use'
      },
      {
        label: 'Redraw'
      },
      {
        label: 'Object Browser'
      },
      {
        label: 'Select items'
      },
      {
        label: 'Command'
      }
    ]
  },
  {
    label: 'Edit',
    submenu: [
      {
        label: 'Undo',
        role: 'undo'
      },
      {
        label: 'Redo',
        role: 'redo'
      },
      {
        label: 'Cut',
        role: 'cut'
      },
      {
        label: 'Copy',
        role: 'copy'
      },
      {
        label: 'Paste',
        role: 'paste'
      },
      {
        label: 'Group selection'
      },
      {
        label: 'Dimensions',
        click() {
          const { BrowserWindow } = require('electron')
          const win = new BrowserWindow({ width: 420, height: 250,
            webPreferences: {
              nodeIntegration: true
            }
          })

          // Load a remote URL
          win.loadURL(`file://${__dirname}/menu/dimensions/dimensions.html`)

        }
      }
    ]
  },
  {
    label: 'Bookmarks',
    submenu: [
      {
        label: 'Bookmark this position',
        click() {
          const { BrowserWindow } = require('electron')
          const win = new BrowserWindow({ width: 420, height: 180,
            webPreferences: {
              nodeIntegration: true
            }
           })

          // Load a remote URL
          win.loadURL(`file://${__dirname}/menu/bookmark-position/bookmark-position.html`)

        }
      },
      {
        label: 'Delete...',
        submenu: [
        ]
      },
      {
        type: 'separator'
      }
    ]
  },
  {
    label: 'Insert',
    submenu: [
      {
        label: 'Godley Table'
      },
      {
        label: 'Variable',
        submenu: [
          {
            type: 'separator'
          },
          {
            label: 'variable',
            click() {
              createVariablePopUp('variable');
            }
          },
          {
            label: 'constant',
            click() {
              createVariablePopUp('constant');
            }
          },
          {
            label: 'parameter',
            click() {
              createVariablePopUp('parameter');
            }
          }
        ]
      },
      {
        label: 'Binary Ops',
        submenu: [
          {
            label: 'add'
          },
          {
            label: 'subtract'
          },
          {
            label: 'multiple'
          },
          {
            label: 'divide'
          },
          {
            label: 'min'
          },
          {
            label: 'max'
          },
          {
            label: 'and'
          },
          {
            label: 'or'
          },
          {
            label: 'log'
          },
          {
            label: 'pow'
          },
          {
            label: 'lt'
          },
          {
            label: 'le'
          },
          {
            label: 'eq'
          }
        ]
      },
      {
        label: 'Functions',
        submenu: [
          {
            label: 'copy'
          },
          {
            label: 'sqrt'
          },
          {
            label: 'exp'
          },
          {
            label: 'ln'
          },
          {
            label: 'sin'
          },
          {
            label: 'cos'
          },
          {
            label: 'tan'
          },
          {
            label: 'asin'
          },
          {
            label: 'acos'
          },
          {
            label: 'atan'
          },
          {
            label: 'sinh'
          },
          {
            label: 'cosh'
          },
          {
            label: 'tanh'
          },
          {
            label: 'abs'
          },
          {
            label: 'floor'
          },
          {
            label: 'frac'
          },
          {
            label: 'not'
          }
        ]
      },
      {
        label: 'Reductions',
        submenu: [
          {
            label: 'sum'
          },
          {
            label: 'product'
          },
          {
            label: 'infimum'
          },
          {
            label: 'supremum'
          },
          {
            label: 'any'
          },
          {
            label: 'all'
          },
          {
            label: 'infIndex'
          },
          {
            label: 'supIndex'
          }
        ]
      },
      {
        label: 'Scans',
        submenu: [
          {
            label: 'runningSum'
          },
          {
            label: 'runningProduct'
          },
          {
            label: 'difference'
          }
        ]
      },
      {
        label: 'Tensor operations',
        submenu: [
          {
            label: 'innerProduct'
          },
          {
            label: 'outerProduct'
          },
          {
            label: 'index'
          },
          {
            label: 'gather'
          }
        ]
      },
      {
        label: 'time'
      },
      {
        label: 'integrate'
      },
      {
        label: 'differentiate'
      },
      {
        label: 'data'
      },
      {
        label: 'ravel'
      },
      {
        label: 'plot'
      }
    ]
  },
  {
    label: 'Options',
    submenu: [
      {
        label: 'Preferences',
        click() {
          const { BrowserWindow } = require('electron')
          const win = new BrowserWindow({
            width: 550, height: 450,
            webPreferences: {
              nodeIntegration: true
            }
          })

          // Load a remote URL
          win.loadURL(`file://${__dirname}/menu/preferences/preferences.html`)

        }
      },
      {
        label: 'Background Color'
      }
    ]
  },
  {
    label: 'Runge Kutta',
    submenu: [
      {
        label: 'Runge Kutta',
        click() {
          const { BrowserWindow } = require('electron')
          const win = new BrowserWindow({ width: 550, height: 550,
            webPreferences: {
              nodeIntegration: true
            }
          })

          // Load a remote URL
          win.loadURL(`file://${__dirname}/menu/runge-kutta-parameters/runge-kutta-parameters.html`)

        }
      }
    ]
  },
  {
    role: 'help',
    submenu: [
      {
        label: 'Minsky Documentation'
      }
    ]
  }
]);

function createVariablePopUp(type) {
  var BrowserWindow = require('electron').BrowserWindow;
  var variable_window = new BrowserWindow({
    width: 300,
    height: 420,
    title: "Specify variable name",
    resizable: false,
    minimizable: false,
    parent: win,
    modal: true,
    backgroundColor: '#c8ccd0',
    webPreferences: {
      nodeIntegration: true
    }
  });
  variable_window.setMenu(null);
  variable_window.loadURL("file://" + __dirname + "/menu/create_variable/create_variable.html");
  variable_window.on('closed', () => {
    console.log('closed', type);
    variable_window = null;
  });
}




import { Menu, BrowserWindow, ipcMain,shell } from 'electron';
import { win } from './main';

let aboutWin: BrowserWindow;
let variable_window : BrowserWindow;
ipcMain.on('about:close', (event) => {
  aboutWin.close();
});
ipcMain.on('create_variable:ok', (event) => {
  variable_window.close();
});
ipcMain.on('create_variable:cancel', (event) => {
  variable_window.close();
});
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
              title: ""
            })
          //setting menu for child window
          aboutWin.setMenu(null);
          // Load a remote URL
          aboutWin.loadURL(`file://${__dirname}/menu/about/about.html`)
          // aboutWin.webContents.openDevTools();

          //The window will show when it is ready
          aboutWin.once('ready-to-show',()=>{
             aboutWin.show();
             shell.beep();
          });

          aboutWin.on('closed', function () {
            aboutWin = null;
        });

            // createMenuPopUp(480,445, "About Minsky","/menu/about/about.html")
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
        accelerator: 'Ctrl + N'
      },
      {
        label: 'Open',
        click(){
          shell.openPath('c:\\');
        },
        accelerator: 'Ctrl + O'
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
        label: 'Save',
        accelerator: 'Ctrl + S'
      },
      {
        label: 'SaveAs',
        accelerator: 'Ctrl + A'
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
        label: 'Quit',
        accelerator: 'Ctrl + Q'
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

          createMenuPopUp(420,250,"Dimensions","/menu/dimensions/dimensions.html");

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

           createMenuPopUp(420,180,"Bookmark this position","/menu/bookmark-position/bookmark-position.html");

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
            label: 'add',
            click() {
              console.log("add")
            }
          },
          {
            label: 'subtract',
            click() {
              
            }
          },
          {
            label: 'multiple',
            click() {
              
            }
          },
          {
            label: 'divide',
            click() {
              
            }
          },
          {
            label: 'min',
            click() {
              
            }
          },
          {
            label: 'max',
            click() {
              
            }
          },
          {
            label: 'and',
            click() {
              
            }
          },
          {
            label: 'or',
            click() {
              
            }
          },
          {
            label: 'log',
            click() {
              
            }
          },
          {
            label: 'pow',
            click() {
              
            }
          },
          {
            label: 'lt',
            click() {
              
            }
          },
          {
            label: 'le',
            click() {
              
            }
          },
          {
            label: 'eq',
            click() {
              
            }
          }
        ]
      },
      {
        label: 'Functions',
        submenu: [
          {
            label: 'copy',
            click() {
              
            }
          },
          {
            label: 'sqrt',
            click() {
              
            }
          },
          {
            label: 'exp',
            click() {
              
            }
          },
          {
            label: 'ln',
            click() {
              
            }
          },
          {
            label: 'sin',
            click() {
              
            }
          },
          {
            label: 'cos',
            click() {
              
            }
          },
          {
            label: 'tan',
            click() {
              
            }
          },
          {
            label: 'asin',
            click() {
              
            }
          },
          {
            label: 'acos',
            click() {
              
            }
          },
          {
            label: 'atan',
            click() {
              
            }
          },
          {
            label: 'sinh',
            click() {
              
            }
          },
          {
            label: 'cosh',
            click() {
              
            }
          },
          {
            label: 'tanh',
            click() {
              
            }
          },
          {
            label: 'abs',
            click() {
              
            }
          },
          {
            label: 'floor',
            click() {
              
            }
          },
          {
            label: 'frac',
            click() {
              
            }
          },
          {
            label: 'not',
            click() {
              
            }
          }
        ]
      },
      {
        label: 'Reductions',
        submenu: [
          {
            label: 'sum',
            click() {
              
            }
          },
          {
            label: 'product',
            click() {
              
            }
          },
          {
            label: 'infimum',
            click() {
              
            }
          },
          {
            label: 'supremum',
            click() {
              
            }
          },
          {
            label: 'any',
            click() {
              
            }
          },
          {
            label: 'all',
            click() {
              
            }
          },
          {
            label: 'infIndex',
            click() {
              
            }
          },
          {
            label: 'supIndex',
            click() {
              
            }
          }
        ]
      },
      {
        label: 'Scans',
        submenu: [
          {
            label: 'runningSum',
            click() {
              
            }
          },
          {
            label: 'runningProduct',
            click() {
              
            }
          },
          {
            label: 'difference',
            click() {
              
            }
          }
        ]
      },
      {
        label: 'Tensor operations',
        submenu: [
          {
            label: 'innerProduct',
            click() {
              
            }
          },
          {
            label: 'outerProduct',
            click() {
              
            }
          },
          {
            label: 'index',
            click() {
              
            }
          },
          {
            label: 'gather',
            click() {
              
            }
          }
        ]
      },
      {
        label: 'time',
        click() {
          
        }
      },
      {
        label: 'integrate',
        click() {
          
        }
      },
      {
        label: 'differentiate',
        click() {
          
        }
      },
      {
        label: 'data',
        click() {
          
        }
      },
      {
        label: 'ravel',
        click() {
          
        }
      },
      {
        label: 'plot',
        click() {
          
        }
      }
    ]
  },
  {
    label: 'Options',
    submenu: [
      {
        label: 'Preferences',
        click() {

          createMenuPopUp(550,450,"Preferences","/menu/preferences/preferences.html");

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

          createMenuPopUp(550,550,"Runge Kutta","/menu/runge-kutta-parameters/runge-kutta-parameters.html");

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
 
   variable_window = new BrowserWindow({
    width: 320,
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

function createMenuPopUp(width,height,title,dir_path){
  var BrowserWindow = require('electron').BrowserWindow;
  var menu_window = new BrowserWindow({
    width: width,
    height: height,
    title: title,
    resizable: false,
    minimizable: false,
    parent: win,
    modal: true,
    backgroundColor: '#c8ccd0',
    webPreferences: {
      nodeIntegration: true
    }
  });
  menu_window.setMenu(null);
  menu_window.loadURL("file://" + __dirname + dir_path);
  menu_window.on('closed', () => {
    // console.log('closed', type);
    menu_window = null;
  });
}




import { Menu, BrowserWindow, ipcMain, shell,dialog } from 'electron';
import { win ,getStorageBackgroundColor,setStorageBackgroundColor} from './main';
const electron = require('electron');
const storage = require('electron-json-storage');
storage.setDataPath((electron.app || electron.remote.app).getPath('userData'));
const fs = require('fs');

var menu_window: BrowserWindow;
ipcMain.on('create_variable:ok', (event) => {
  menu_window.close();
});

ipcMain.on('background-color:ok', (event, data) => {
  storage.set('backgroundColor',{color:data.color});
  checkBackgroundAndApplyTextColor(data.color);
  setStorageBackgroundColor(data.color);
  menu_window.close();
});


export const template = Menu.buildFromTemplate([
  {
    label: 'File',
    submenu: [
      {
        label: 'About Minsky',
        //It will open a child window when about menu is clicked.
        click() {
          createMenuPopUp(420, 440, "", "/menu/file/about/about.html", "#ffffff");
          shell.beep()
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
        accelerator: 'CmdOrCtrl + O',
        click() {
          const files = dialog.showOpenDialog(win, {
            properties: ['openFile'],
            filters: [{ name: 'text', extensions: ['txt'] }]
          });

          files.then(result => {
            console.log(result.canceled)
            console.log(result.filePaths)
            console.log(fs.readFileSync(result.filePaths[0]).toString())
          }).catch(err => {
            console.log("file is not selected")
          })
        }
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
        click() {
          shell.openExternal('https://github.com/highperformancecoder/minsky-models');
        }
      },
      {
        label: 'Save',
        accelerator: 'CmdOrCtrl + S',
        click() {
          let content = "This is the content of new file";
          dialog.showSaveDialog(win, { filters: [{ name: 'text', extensions: ['txt'] }] }).
            then(result => {
              console.log(result)
              fs.writeFile(result.filePath, content, (err) => {
                if (err)
                  console.log(err);
              })
            }).catch(err => {
              console.log("file is not saved")
            })
        }
      },
      {
        label: 'SaveAs',
        accelerator: 'Ctrl + A'
      },
      {
        label: 'Insert File as Group'
      },
      {
        label: 'Dimensional Analysis',
        click() {
          createMenuPopUp(240, 153, "", "/menu/file/dimensional-analysis/dimensional_analysis.html", "#ffffff");
        }
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
        label: 'Log simulation',
        click() {
          createMenuPopUp(250, 500, "Log simulation", "/menu/log-simulation/log-simulation.html", null);
        }
      },
      {
        label: 'Recording'
      },
      {
        label: 'Replay recording'
      },
      {
        label: 'Quit',
        accelerator: 'Ctrl + Q',
        role: 'quit'
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
        label: 'Select items',
        click() {
          createMenuPopUp(290, 153, "", "/menu/file/select-items/select_items.html", "#ffffff");
        }
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

          createMenuPopUp(420, 250, "Dimensions", "/menu/edit/dimensions/dimensions-popup.html", null);

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

          createMenuPopUp(420, 180, "Bookmark this position", "/menu/bookmark-position/bookmark-position.html", null);

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
              createMenuPopUp(320, 420, "Specify variable name", "/menu/create_variable/create_variable.html", null);
            }
          },
          {
            label: 'constant',
            click() {
              createMenuPopUp(320, 420, "Specify variable name", "/menu/create_variable/create_variable.html", null);
            }
          },
          {
            label: 'parameter',
            click() {
              createMenuPopUp(320, 420, "Specify variable name", "/menu/create_variable/create_variable.html", null);
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

          createMenuPopUp(550, 450, "Preferences", "/menu/preferences/preferences.html", null);

        }
      },
      {
        label: 'Background Colour',
        click() {
          createMenuPopUp(350, 350, "Background Colour", "/menu/options/background-color/background-color.html", null);
        }
      }
    ]
  },
  {
    label: 'Runge Kutta',
    submenu: [
      {
        label: 'Runge Kutta',
        click() {

          createMenuPopUp(550, 550, "Runge Kutta", "/menu/runge-kutta-parameters/runge-kutta-parameters.html", null);

        }
      }
    ]
  },
  {
    role: 'help',
    submenu: [
      {
        label: 'Minsky Documentation',
        click() {
          const shell = require('electron').shell
          shell.openExternal('https://minsky.sourceforge.io/manual/minsky.html');
        }
      }
    ]
  }
]);


function createMenuPopUp(width, height, title, dir_path, background_color) {
  background_color = background_color || getStorageBackgroundColor();
  var BrowserWindow = require('electron').BrowserWindow;
  menu_window = new BrowserWindow({
    width: width,
    height: height,
    title: title,
    resizable: false,
    minimizable: false,
    show: false,
    parent: win,
    modal: true,
    backgroundColor: background_color,
    webPreferences: {
      nodeIntegration: true
    }
  });
  menu_window.setMenu(null);
  menu_window.loadURL("file://" + __dirname + dir_path);

  menu_window.once('ready-to-show', () => {
    menu_window.show();
  });

  menu_window.on('closed', () => {
    menu_window = null;
  });
  // Closing global popup event_______
  ipcMain.on('global-menu-popup:cancel', (event) => {
    if (menu_window) {
      menu_window.close();
    }
  });
}

export function checkBackgroundAndApplyTextColor(color){
    // Variables for red, green, blue values
    
    var colorArray;
    var r, g, b, hsp;
    
    // Check the format of the color, HEX or RGB?
    if (color.match(/^rgb/)) {

        // If RGB --> store the red, green, blue values in separate variables
        colorArray = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/);
        
        r = color[1];
        g = color[2];
        b = color[3];
    } 
    else {
        
        // If hex --> Convert it to RGB: http://gist.github.com/983661
        colorArray = +("0x" + color.slice(1).replace( 
        color.length < 5 && /./g, '$&$&'));

        r = colorArray >> 16;
        g = colorArray >> 8 & 255;
        b = colorArray & 255;
    }
    
    // HSP (Highly Sensitive Poo) equation from http://alienryderflex.com/hsp.html
    hsp = Math.sqrt(
    0.299 * (r * r) +
    0.587 * (g * g) +
    0.114 * (b * b)
    );

    // Using the HSP value, determine whether the color is light or dark
    if (hsp>127.5) {
      var css = "body { background-color: " + color + "; color: black; }";
      applyCssToBackground(css);
    } 
    else {
      var css = "body { background-color: " + color + "; color: white; }";
      applyCssToBackground(css);
    }

}
function applyCssToBackground(css){
  win.webContents.insertCSS(css);
}
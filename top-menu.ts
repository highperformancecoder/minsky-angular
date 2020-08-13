import { Menu, BrowserWindow, ipcMain, shell } from 'electron';
import { win } from './main';

var menu_window: BrowserWindow;

ipcMain.on('about:close', (event) => {
  menu_window.close();
});
ipcMain.on('create_variable:ok', (event) => {
  menu_window.close();
});
ipcMain.on('create_variable:cancel', (event) => {
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
          createMenuPopUp(420, 440, "", "/menu/about/about.html", "");
          shell.beep();
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
        click() {
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
        click() {
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
        role: "quit",
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

          createMenuPopUp(420, 250, "Dimensions", "/menu/dimensions/dimensions.html");

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

          createMenuPopUp(420, 180, "Bookmark this position", "/menu/bookmark-position/bookmark-position.html");

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
              createMenuPopUp(320, 420, "Specify variable name", "/menu/create_variable/create_variable.html");
            }
          },
          {
            label: 'constant',
            click() {
              createMenuPopUp(320, 420, "Specify variable name", "/menu/create_variable/create_variable.html");
            }
          },
          {
            label: 'parameter',
            click() {
              createMenuPopUp(320, 420, "Specify variable name", "/menu/create_variable/create_variable.html");
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

          createMenuPopUp(550, 450, "Preferences", "/menu/preferences/preferences.html");

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

          createMenuPopUp(550, 550, "Runge Kutta", "/menu/runge-kutta-parameters/runge-kutta-parameters.html");

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


function createMenuPopUp(width, height, title, dir_path, backgroundColor = '#c8ccd0') {

  menu_window = new BrowserWindow({
    width: width,
    height: height,
    title: title,
    resizable: false,
    minimizable: false,
    show: false,
    parent: win,
    modal: true,
    backgroundColor: backgroundColor,
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
    // console.log('closed', type);
    menu_window = null;
  });
}
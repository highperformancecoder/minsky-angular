import { Injectable } from '@angular/core';
import { createWindow, win } from '../../../../../../../../main.js';
import { ElectronService } from '../electron/electron.service';

const { dialog } = require('electron').remote;

@Injectable({
  providedIn: 'root',
})
export class TopMenuService {
  template: Electron.Menu;

  constructor(private electronService: ElectronService) {
    electronService.ipcRenderer.on('refresh-menu', (event) => {
      this.topMenu();
    });
  }

  topMenu() {
    const openFunc = this.openFunc;
    const remote = this.electronService.remote;
    const fs = this.electronService.fs;
    const createMenuPopUp = this.createMenuPopUp;
    this.template = this.electronService.remote.Menu.buildFromTemplate([
      {
        label: 'File',
        submenu: [
          {
            label: 'About Minsky',
            // It will open a child window when about menu is clicked.
            click() {
              createMenuPopUp(
                420,
                440,
                '',
                '/menu/file/about/about.html',
                '#ffffff'
              );
              remote.shell.beep();
            },
          },
          {
            label: 'Upgrade',
            click() {
              remote.shell.openExternal('https://www.patreon.com/hpcoder');
            },
          },
          {
            label: 'New System',
            accelerator: 'CmdOrCtrl + N',
            click() {
              win.hide();
              createWindow();
            },
          },
          {
            label: 'Open',
            accelerator: 'CmdOrCtrl + O',
            click() {
              const files = dialog.showOpenDialog({
                properties: ['openFile'],
                filters: [{ name: 'text', extensions: ['txt'] }],
              });
              files
                .then((result) => {
                  console.log(result.canceled);
                  console.log(result.filePaths);
                  console.log(fs.readFileSync(result.filePaths[0]).toString());
                  openFunc(result);
                })
                .catch((err) => {
                  console.log(err);
                });
            },
          },
          {
            label: 'Recent Files',
            submenu: [
              {
                label: 'TestFile',
              },
            ],
          },
          {
            label: 'Library',
            click() {
              remote.shell.openExternal(
                'https://github.com/highperformancecoder/minsky-models'
              );
            },
          },
          {
            label: 'Save',
            accelerator: 'CmdOrCtrl + S',
            click() {
              const content = 'This is the content of new file';
              dialog
                .showSaveDialog({
                  filters: [{ name: 'text', extensions: ['txt'] }],
                })
                .then((result) => {
                  console.log(result);
                  this.saveFunc(result);
                  fs.writeFile(result.filePath, content, (err) => {
                    if (err) console.log(err);
                  });
                })
                .catch((err) => {
                  this.saveFunc('data error');
                  console.log('file is not saved');
                });
            },
          },
          {
            label: 'SaveAs',
            accelerator: 'CmdOrCtrl + A',
          },
          {
            label: 'Insert File as Group',
            click() {
              const files = dialog.showOpenDialog({
                properties: ['openFile', 'multiSelections'],
                filters: [{ name: 'text', extensions: ['txt'] }],
              });
              files
                .then((result) => {
                  console.log(result.canceled);
                  console.log(result.filePaths);
                  for (const file of result.filePaths) {
                    console.log(fs.readFileSync(file).toString());
                  }
                })
                .catch((err) => {
                  console.log('file is not selected');
                });
            },
          },
          {
            label: 'Dimensional Analysis',
            click() {
              createMenuPopUp(
                240,
                153,
                '',
                '/menu/file/dimensional-analysis/dimensional-analysis.html',
                '#ffffff'
              );
            },
          },
          {
            label: 'Export Canvas',
          },
          {
            label: 'Export Plots',
            submenu: [
              {
                label: 'as SVG',
              },
              {
                label: 'as CSV',
              },
            ],
          },
          {
            label: 'Log simulation',
            click() {
              createMenuPopUp(
                250,
                500,
                'Log simulation',
                '/menu/file/log-simulation/log-simulation.html',
                null
              );
            },
          },
          {
            label: 'Recording',
          },
          {
            label: 'Replay recording',
          },
          {
            label: 'Quit',
            accelerator: 'Ctrl + Q',
            role: 'quit',
          },
          {
            type: 'separator',
          },
          {
            label: 'Debugging Use',
          },
          {
            label: 'Redraw',
          },
          {
            label: 'Object Browser',
            click() {
              createMenuPopUp(
                400,
                230,
                '',
                '/menu/file/object-browser/object_browser.html',
                null
              );
            },
          },
          {
            label: 'Select items',
            click() {
              createMenuPopUp(
                290,
                153,
                '',
                '/menu/file/select-items/select_items.html',
                '#ffffff'
              );
            },
          },
          {
            label: 'Command',
          },
        ],
      },
      {
        label: 'Edit',
        submenu: [
          {
            label: 'Undo',
            role: 'undo',
          },
          {
            label: 'Redo',
            role: 'redo',
          },
          {
            label: 'Cut',
            role: 'cut',
          },
          {
            label: 'Copy',
            role: 'copy',
          },
          {
            label: 'Paste',
            role: 'paste',
          },
          {
            label: 'Group selection',
          },
          {
            label: 'Dimensions',
            click() {
              createMenuPopUp(
                420,
                250,
                'Dimensions',
                '/menu/edit/dimensions/dimensions-popup.html',
                null
              );
            },
          },
        ],
      },
      {
        label: 'Bookmarks',
        id: 'main-bookmark',
        submenu: [
          {
            label: 'Bookmark this position',
            click() {
              createMenuPopUp(
                420,
                200,
                'Bookmark this position',
                '/menu/bookmark-position/bookmark-position.html',
                null
              );
            },
          },
          {
            label: 'Delete...',
            id: 'delete-bookmark',
            submenu: [],
          },
          {
            type: 'separator',
          },
        ],
      },
      {
        label: 'Insert',
        submenu: [
          {
            label: 'Godley Table',
          },
          {
            label: 'Variable',
            submenu: [
              {
                type: 'separator',
              },
              {
                label: 'variable',
                click() {
                  createMenuPopUp(
                    500,
                    550,
                    'Specify variable name',
                    '/menu/create-variable/create-variable.html',
                    null
                  );
                },
              },
              {
                label: 'constant',
                click() {
                  createMenuPopUp(
                    500,
                    550,
                    'Specify variable name',
                    '/menu/create-variable/create-variable.html',
                    null
                  );
                },
              },
              {
                label: 'parameter',
                click() {
                  createMenuPopUp(
                    500,
                    550,
                    'Specify variable name',
                    '/menu/create-variable/create-variable.html',
                    null
                  );
                },
              },
            ],
          },
          {
            label: 'Binary Ops',
            submenu: [
              {
                label: 'add',
                click() {
                  console.log('add');
                },
              },
              {
                label: 'subtract',
                click() {},
              },
              {
                label: 'multiple',
                click() {},
              },
              {
                label: 'divide',
                click() {},
              },
              {
                label: 'min',
                click() {},
              },
              {
                label: 'max',
                click() {},
              },
              {
                label: 'and',
                click() {},
              },
              {
                label: 'or',
                click() {},
              },
              {
                label: 'log',
                click() {},
              },
              {
                label: 'pow',
                click() {},
              },
              {
                label: 'lt',
                click() {},
              },
              {
                label: 'le',
                click() {},
              },
              {
                label: 'eq',
                click() {},
              },
            ],
          },
          {
            label: 'Functions',
            submenu: [
              {
                label: 'copy',
                click() {},
              },
              {
                label: 'sqrt',
                click() {},
              },
              {
                label: 'exp',
                click() {},
              },
              {
                label: 'ln',
                click() {},
              },
              {
                label: 'sin',
                click() {},
              },
              {
                label: 'cos',
                click() {},
              },
              {
                label: 'tan',
                click() {},
              },
              {
                label: 'asin',
                click() {},
              },
              {
                label: 'acos',
                click() {},
              },
              {
                label: 'atan',

                click() {},
              },
              {
                label: 'sinh',
                click() {},
              },
              {
                label: 'cosh',
                click() {},
              },
              {
                label: 'tanh',
                click() {},
              },
              {
                label: 'abs',
                click() {},
              },
              {
                label: 'floor',
                click() {},
              },
              {
                label: 'frac',
                click() {},
              },
              {
                label: 'not',
                click() {},
              },
            ],
          },
          {
            label: 'Reductions',
            submenu: [
              {
                label: 'sum',
                click() {},
              },
              {
                label: 'product',
                click() {},
              },
              {
                label: 'infimum',
                click() {},
              },
              {
                label: 'supremum',
                click() {},
              },
              {
                label: 'any',
                click() {},
              },
              {
                label: 'all',
                click() {},
              },
              {
                label: 'infIndex',
                click() {},
              },
              {
                label: 'supIndex',
                click() {},
              },
            ],
          },
          {
            label: 'Scans',
            submenu: [
              {
                label: 'runningSum',
                click() {},
              },
              {
                label: 'runningProduct',
                click() {},
              },
              {
                label: 'difference',
                click() {},
              },
            ],
          },
          {
            label: 'Tensor operations',
            submenu: [
              {
                label: 'innerProduct',
                click() {},
              },
              {
                label: 'outerProduct',
                click() {},
              },
              {
                label: 'index',
                click() {},
              },
              {
                label: 'gather',
                click() {},
              },
            ],
          },
          {
            label: 'time',
            click() {},
          },
          {
            label: 'integrate',
            click() {},
          },
          {
            label: 'differentiate',
            click() {},
          },
          {
            label: 'data',
            click() {},
          },
          {
            label: 'ravel',
            click() {},
          },
          {
            label: 'plot',
            click() {},
          },
        ],
      },
      {
        label: 'Options',
        submenu: [
          {
            label: 'Preferences',
            click() {
              createMenuPopUp(
                550,
                450,
                'Preferences',
                '/menu/preferences/preferences.html',
                null
              );
            },
          },
          {
            label: 'Background Colour',
            click() {
              createMenuPopUp(
                450,
                320,
                'Background Colour',
                '/menu/options/background-color/background-color.html',
                null
              );
            },
          },
        ],
      },
      {
        label: 'Runge Kutta',
        submenu: [
          {
            label: 'Runge Kutta',
            click() {
              createMenuPopUp(
                550,
                550,
                'Runge Kutta',
                '/menu/runge-kutta-parameters/runge-kutta-parameters.html',
                null
              );
            },
          },
        ],
      },
      {
        role: 'help',
        submenu: [
          {
            label: 'Minsky Documentation',
            click() {
              remote.shell.openExternal(
                'https://minsky.sourceforge.io/manual/minsky.html'
              );
            },
          },
        ],
      },
    ]);
    this.electronService.remote.Menu.setApplicationMenu(this.template);
    this.electronService.ipcRenderer.send('ready-template');
    // this.electronService.ipcRenderer.send('minsky-menu',template)
  }

  // this function open new popup window from main.ts
  createMenuPopUp = (width, height, title, dirPath, bgColor) => {
    const data = {
      width,
      height,
      title,
      dirPath,
      bgColor,
    };
    this.electronService.ipcRenderer.send('create-new-window', data);
  };

  openFunc(data) {
    // win.webContents.send('Open_file', data)
  }
  saveFunc(data) {
    // win.webContents.send('Save_file', data)
  }
}

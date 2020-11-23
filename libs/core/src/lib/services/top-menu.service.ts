import { Injectable } from '@angular/core';
import { ElectronService } from '@minsky/core';

@Injectable({
  providedIn: 'root',
})
export class TopMenuService {
  template: Electron.Menu;
  constructor(private electronService: ElectronService) {
    if (electronService.isElectron) {
      electronService.ipcRenderer.on('refresh-menu', (event) => {
        this.topMenu();
      });
    }
  }

  topMenu() {
    const menuDir = '/home/jarvis/Documents/minsky/apps/minsky-electron';

    const openFunc = this.openFunc;
    const remote = this.electronService.remote;
    const fs = this.electronService.fs;
    const dialog = this.electronService.dialog;
    const createMenuPopUp = this.createMenuPopUp;
    const createMenuPopUpWithRouting = this.createMenuPopUpWithRouting;
    this.template = this.electronService.remote.Menu.buildFromTemplate([
      {
        label: 'File',
        submenu: [
          {
            label: 'About Minsky',
            click() {
              createMenuPopUpWithRouting({
                width: 420,
                height: 440,
                title: '',
                url: 'http://localhost:4200/#/menu/file/about',
                backgroundColor: '#ffffff',
              });

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
              console.log('TODO -> topMenu -> New System');
              // win.hide();
              // createWindow();
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
              createMenuPopUpWithRouting({
                width: 240,
                height: 153,
                title: '',
                url: 'http://localhost:4200/#/menu/file/dimensional-analysis',
                backgroundColor: '#ffffff',
              });

              // createMenuPopUp(
              //   240,
              //   153,
              //   '',
              //   menuDir +
              //     '/menu/file/dimensional-analysis/dimensional-analysis.html',
              //   '#ffffff'
              // );
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
              createMenuPopUpWithRouting({
                width: 250,
                height: 500,
                title: 'Log simulation',
                url: 'http://localhost:4200/#/menu/file/log-simulation',
                backgroundColor: '#ffffff',
              });

              // createMenuPopUp(
              //   250,
              //   500,
              //   'Log simulation',
              //   menuDir + '/menu/file/log-simulation/log-simulation.html',
              //   null
              // );
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
              createMenuPopUpWithRouting({
                width: 400,
                height: 230,
                title: '',
                url: 'http://localhost:4200/#/menu/file/object-browser',
                backgroundColor: '#ffffff',
              });

              // createMenuPopUp(
              //   400,
              //   230,
              //   '',
              //   menuDir + '/menu/file/object-browser/object_browser.html',
              //   null
              // );
            },
          },
          {
            label: 'Select items',
            click() {
              createMenuPopUpWithRouting({
                width: 290,
                height: 153,
                title: '',
                url: 'http://localhost:4200/#/menu/file/select-items',
                backgroundColor: '#ffffff',
              });

              // createMenuPopUp(
              //   290,
              //   153,
              //   '',
              //   menuDir + '/menu/file/select-items/select_items.html',
              //   '#ffffff'
              // );
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
              createMenuPopUpWithRouting({
                width: 420,
                height: 250,
                title: 'Dimensions',
                url: 'http://localhost:4200/#/menu/edit/dimensions',
                backgroundColor: '#ffffff',
              });

              // createMenuPopUp(
              //   420,
              //   250,
              //   'Dimensions',
              //   menuDir + '/menu/edit/dimensions/dimensions-popup.html',
              //   null
              // );
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
              createMenuPopUpWithRouting({
                width: 420,
                height: 200,
                title: 'Bookmark this position',
                url: 'http://localhost:4200/#/menu/bookmarks/bookmark-position',
                backgroundColor: '#ffffff',
              });

              // createMenuPopUp(
              //   420,
              //   200,
              //   'Bookmark this position',
              //   menuDir + '/menu/bookmark-position/bookmark-position.html',
              //   null
              // );
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
                  createMenuPopUpWithRouting({
                    width: 500,
                    height: 550,
                    title: 'Specify variable name',
                    url: 'http://localhost:4200/#/menu/insert/create-variable',
                    backgroundColor: '#ffffff',
                  });

                  /* createMenuPopUp(
                    500,
                    550,
                    'Specify variable name',
                    menuDir + '/menu/create-variable/create-variable.html',
                    null
                  ); */
                },
              },
              {
                label: 'constant',
                click() {
                  createMenuPopUpWithRouting({
                    width: 500,
                    height: 550,
                    title: 'Specify variable name',
                    url: 'http://localhost:4200/#/menu/insert/create-variable',
                    backgroundColor: '#ffffff',
                  });

                  /* createMenuPopUp(
                    500,
                    550,
                    'Specify variable name',
                    menuDir + '/menu/create-variable/create-variable.html',
                    null
                  ); */
                },
              },
              {
                label: 'parameter',
                click() {
                  createMenuPopUpWithRouting({
                    width: 500,
                    height: 550,
                    title: 'Specify variable name',
                    url: 'http://localhost:4200/#/menu/insert/create-variable',
                    backgroundColor: '#ffffff',
                  });

                  /* createMenuPopUp(
                    500,
                    550,
                    'Specify variable name',
                    menuDir + '/menu/create-variable/create-variable.html',
                    null
                  ); */
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
                menuDir + '/menu/preferences/preferences.html',
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
                menuDir +
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
                menuDir +
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

  createMenuPopUpWithRouting = ({
    width,
    height,
    title,
    url,
    backgroundColor,
  }) => {
    this.electronService.ipcRenderer.send('create-menu-popup', {
      width,
      height,
      title,
      url,
      backgroundColor,
    });
  };

  openFunc(data) {
    // win.webContents.send('Open_file', data)
  }
  saveFunc(data) {
    // win.webContents.send('Save_file', data)
  }
}

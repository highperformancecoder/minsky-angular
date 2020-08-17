"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var main_1 = require("./main");
var electron = require('electron');
var storage = require('electron-json-storage');
storage.setDataPath((electron.app || electron.remote.app).getPath('userData'));
var fs = require('fs');
var menu_window;
electron_1.ipcMain.on('create_variable:ok', function (event) {
    menu_window.close();
});
electron_1.ipcMain.on('background-color:ok', function (event, data) {
    var css = "body { background-color: " + data.color + "; color: black; }";
    storage.set('backgroundColor', { color: data.color });
    main_1.win.webContents.insertCSS(css);
    main_1.setStorageBackgroundColor(data.color);
    menu_window.close();
});
exports.template = electron_1.Menu.buildFromTemplate([
    {
        label: 'File',
        submenu: [
            {
                label: 'About Minsky',
                //It will open a child window when about menu is clicked.
                click: function () {
                    createMenuPopUp(420, 440, "", "/menu/file/about/about.html", "#ffffff");
                    electron_1.shell.beep();
                }
            },
            {
                label: 'Upgrade',
                click: function () {
                    electron_1.shell.openExternal('https://www.patreon.com/hpcoder');
                }
            },
            {
                label: 'New System',
                accelerator: 'Ctrl + N'
            },
            {
                label: 'Open',
                accelerator: 'CmdOrCtrl + O',
                click: function () {
                    var files = electron_1.dialog.showOpenDialog(main_1.win, {
                        properties: ['openFile'],
                        filters: [{ name: 'text', extensions: ['txt'] }]
                    });
                    files.then(function (result) {
                        console.log(result.canceled);
                        console.log(result.filePaths);
                        console.log(fs.readFileSync(result.filePaths[0]).toString());
                    }).catch(function (err) {
                        console.log("file is not selected");
                    });
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
                click: function () {
                    electron_1.shell.openExternal('https://github.com/highperformancecoder/minsky-models');
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
                label: 'Dimensional Analysis',
                click: function () {
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
                click: function () {
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
                click: function () {
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
                click: function () {
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
                click: function () {
                    createMenuPopUp(420, 180, "Bookmark this position", "/menu/bookmark-position/bookmark-position.html", null);
                }
            },
            {
                label: 'Delete...',
                submenu: []
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
                        click: function () {
                            createMenuPopUp(320, 420, "Specify variable name", "/menu/create_variable/create_variable.html", null);
                        }
                    },
                    {
                        label: 'constant',
                        click: function () {
                            createMenuPopUp(320, 420, "Specify variable name", "/menu/create_variable/create_variable.html", null);
                        }
                    },
                    {
                        label: 'parameter',
                        click: function () {
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
                        click: function () {
                            console.log("add");
                        }
                    },
                    {
                        label: 'subtract',
                        click: function () {
                        }
                    },
                    {
                        label: 'multiple',
                        click: function () {
                        }
                    },
                    {
                        label: 'divide',
                        click: function () {
                        }
                    },
                    {
                        label: 'min',
                        click: function () {
                        }
                    },
                    {
                        label: 'max',
                        click: function () {
                        }
                    },
                    {
                        label: 'and',
                        click: function () {
                        }
                    },
                    {
                        label: 'or',
                        click: function () {
                        }
                    },
                    {
                        label: 'log',
                        click: function () {
                        }
                    },
                    {
                        label: 'pow',
                        click: function () {
                        }
                    },
                    {
                        label: 'lt',
                        click: function () {
                        }
                    },
                    {
                        label: 'le',
                        click: function () {
                        }
                    },
                    {
                        label: 'eq',
                        click: function () {
                        }
                    }
                ]
            },
            {
                label: 'Functions',
                submenu: [
                    {
                        label: 'copy',
                        click: function () {
                        }
                    },
                    {
                        label: 'sqrt',
                        click: function () {
                        }
                    },
                    {
                        label: 'exp',
                        click: function () {
                        }
                    },
                    {
                        label: 'ln',
                        click: function () {
                        }
                    },
                    {
                        label: 'sin',
                        click: function () {
                        }
                    },
                    {
                        label: 'cos',
                        click: function () {
                        }
                    },
                    {
                        label: 'tan',
                        click: function () {
                        }
                    },
                    {
                        label: 'asin',
                        click: function () {
                        }
                    },
                    {
                        label: 'acos',
                        click: function () {
                        }
                    },
                    {
                        label: 'atan',
                        click: function () {
                        }
                    },
                    {
                        label: 'sinh',
                        click: function () {
                        }
                    },
                    {
                        label: 'cosh',
                        click: function () {
                        }
                    },
                    {
                        label: 'tanh',
                        click: function () {
                        }
                    },
                    {
                        label: 'abs',
                        click: function () {
                        }
                    },
                    {
                        label: 'floor',
                        click: function () {
                        }
                    },
                    {
                        label: 'frac',
                        click: function () {
                        }
                    },
                    {
                        label: 'not',
                        click: function () {
                        }
                    }
                ]
            },
            {
                label: 'Reductions',
                submenu: [
                    {
                        label: 'sum',
                        click: function () {
                        }
                    },
                    {
                        label: 'product',
                        click: function () {
                        }
                    },
                    {
                        label: 'infimum',
                        click: function () {
                        }
                    },
                    {
                        label: 'supremum',
                        click: function () {
                        }
                    },
                    {
                        label: 'any',
                        click: function () {
                        }
                    },
                    {
                        label: 'all',
                        click: function () {
                        }
                    },
                    {
                        label: 'infIndex',
                        click: function () {
                        }
                    },
                    {
                        label: 'supIndex',
                        click: function () {
                        }
                    }
                ]
            },
            {
                label: 'Scans',
                submenu: [
                    {
                        label: 'runningSum',
                        click: function () {
                        }
                    },
                    {
                        label: 'runningProduct',
                        click: function () {
                        }
                    },
                    {
                        label: 'difference',
                        click: function () {
                        }
                    }
                ]
            },
            {
                label: 'Tensor operations',
                submenu: [
                    {
                        label: 'innerProduct',
                        click: function () {
                        }
                    },
                    {
                        label: 'outerProduct',
                        click: function () {
                        }
                    },
                    {
                        label: 'index',
                        click: function () {
                        }
                    },
                    {
                        label: 'gather',
                        click: function () {
                        }
                    }
                ]
            },
            {
                label: 'time',
                click: function () {
                }
            },
            {
                label: 'integrate',
                click: function () {
                }
            },
            {
                label: 'differentiate',
                click: function () {
                }
            },
            {
                label: 'data',
                click: function () {
                }
            },
            {
                label: 'ravel',
                click: function () {
                }
            },
            {
                label: 'plot',
                click: function () {
                }
            }
        ]
    },
    {
        label: 'Options',
        submenu: [
            {
                label: 'Preferences',
                click: function () {
                    createMenuPopUp(550, 450, "Preferences", "/menu/preferences/preferences.html", null);
                }
            },
            {
                label: 'Background Colour',
                click: function () {
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
                click: function () {
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
                click: function () {
                    var shell = require('electron').shell;
                    shell.openExternal('https://minsky.sourceforge.io/manual/minsky.html');
                }
            }
        ]
    }
]);
function createMenuPopUp(width, height, title, dir_path, background_color) {
    background_color = background_color || main_1.getStorageBackgroundColor();
    var BrowserWindow = require('electron').BrowserWindow;
    menu_window = new BrowserWindow({
        width: width,
        height: height,
        title: title,
        resizable: false,
        minimizable: false,
        show: false,
        parent: main_1.win,
        modal: true,
        backgroundColor: background_color,
        webPreferences: {
            nodeIntegration: true
        }
    });
    menu_window.setMenu(null);
    menu_window.loadURL("file://" + __dirname + dir_path);
    menu_window.once('ready-to-show', function () {
        menu_window.show();
    });
    menu_window.on('closed', function () {
        menu_window = null;
    });
    // Closing global popup event_______
    electron_1.ipcMain.on('global-menu-popup:cancel', function (event) {
        if (menu_window) {
            menu_window.close();
        }
    });
}
//# sourceMappingURL=top-menu.js.map
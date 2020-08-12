"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var main_1 = require("./main");
var aboutWin;
var variable_window;
electron_1.ipcMain.on('about:close', function (event) {
    aboutWin.close();
});
electron_1.ipcMain.on('create_variable:ok', function (event) {
    variable_window.close();
});
electron_1.ipcMain.on('create_variable:cancel', function (event) {
    variable_window.close();
});
exports.template = electron_1.Menu.buildFromTemplate([
    {
        label: 'File',
        submenu: [
            {
                label: 'About Minsky',
                //It will open a child window when about menu is clicked.
                click: function () {
                    aboutWin = new electron_1.BrowserWindow({
                        width: 480, height: 445,
                        webPreferences: { nodeIntegration: true },
                        resizable: false,
                        minimizable: false,
                        parent: main_1.win,
                        modal: true,
                        show: false,
                        title: "About Minsky"
                    });
                    //setting menu for child window
                    aboutWin.setMenu(null);
                    // Load a remote URL
                    aboutWin.loadURL("file://" + __dirname + "/menu/about/about.html");
                    // aboutWin.webContents.openDevTools();
                    //The window will show when it is ready
                    aboutWin.once('ready-to-show', function () {
                        aboutWin.show();
                        electron_1.shell.beep();
                    });
                    aboutWin.on('closed', function () {
                        aboutWin = null;
                    });
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
                click: function () {
                    electron_1.shell.openPath('c:\\');
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
                click: function () {
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
                click: function () {
                    createMenuPopUp(420, 180, "Bookmark this position", "/menu/bookmark-position/bookmark-position.html");
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
                            createVariablePopUp('variable');
                        }
                    },
                    {
                        label: 'constant',
                        click: function () {
                            createVariablePopUp('constant');
                        }
                    },
                    {
                        label: 'parameter',
                        click: function () {
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
                click: function () {
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
function createVariablePopUp(type) {
    variable_window = new electron_1.BrowserWindow({
        width: 320,
        height: 420,
        title: "Specify variable name",
        resizable: false,
        minimizable: false,
        parent: main_1.win,
        modal: true,
        backgroundColor: '#c8ccd0',
        webPreferences: {
            nodeIntegration: true
        }
    });
    variable_window.setMenu(null);
    variable_window.loadURL("file://" + __dirname + "/menu/create_variable/create_variable.html");
    variable_window.on('closed', function () {
        console.log('closed', type);
        variable_window = null;
    });
}
function createMenuPopUp(width, height, title, dir_path) {
    var BrowserWindow = require('electron').BrowserWindow;
    var menu_window = new BrowserWindow({
        width: width,
        height: height,
        title: title,
        resizable: false,
        minimizable: false,
        parent: main_1.win,
        modal: true,
        backgroundColor: '#c8ccd0',
        webPreferences: {
            nodeIntegration: true
        }
    });
    menu_window.setMenu(null);
    menu_window.loadURL("file://" + __dirname + dir_path);
    menu_window.on('closed', function () {
        // console.log('closed', type);
        menu_window = null;
    });
}
//# sourceMappingURL=top-menu.js.map
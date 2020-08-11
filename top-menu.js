"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var aboutWin;
electron_1.ipcMain.on('about:close', function (event) {
    aboutWin.close();
});
exports.template = electron_1.Menu.buildFromTemplate([
    {
        label: 'File',
        submenu: [
            {
                label: 'About Minsky',
                //It will open a child window when about menu is clicked.
                click: function () {
                    aboutWin = new electron_1.BrowserWindow({ width: 420, height: 450, webPreferences: { nodeIntegration: true },
                        title: "About Minsky" });
                    //setting menu for child window                          
                    var childMenu = electron_1.Menu.buildFromTemplate([{ label: '' }]);
                    aboutWin.setMenu(childMenu);
                    // Load a remote URL
                    aboutWin.loadURL("file://" + __dirname + "/static_popups/about.html");
                    // aboutWin.webContents.openDevTools();
                }
            },
            {
                label: 'Upgrade'
            },
            {
                label: 'New System'
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
                label: 'Library'
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
                click: function () {
                    var BrowserWindow = require('electron').BrowserWindow;
                    var win = new BrowserWindow({ width: 420, height: 250 });
                    // Load a remote URL
                    win.loadURL("file://" + __dirname + "/static_popups/dimensions.html");
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
                    var BrowserWindow = require('electron').BrowserWindow;
                    var win = new BrowserWindow({ width: 420, height: 180 });
                    // Load a remote URL
                    win.loadURL("file://" + __dirname + "/static_popups/bookmark-position.html");
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
                            var BrowserWindow = require('electron').BrowserWindow;
                            var win = new BrowserWindow({ width: 450, height: 550 });
                            // Load a remote URL
                            win.loadURL("file://" + __dirname + "/static_popups/create_variable.html");
                        }
                    },
                    {
                        label: 'constant',
                        click: function () {
                            var BrowserWindow = require('electron').BrowserWindow;
                            var win = new BrowserWindow({ width: 450, height: 550 });
                            // Load a remote URL
                            win.loadURL("file://" + __dirname + "/static_popups/create_variable.html");
                        }
                    },
                    {
                        label: 'parameter',
                        click: function () {
                            var BrowserWindow = require('electron').BrowserWindow;
                            var win = new BrowserWindow({ width: 450, height: 550 });
                            // Load a remote URL
                            win.loadURL("file://" + __dirname + "/static_popups/create_variable.html");
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
                click: function () {
                    var BrowserWindow = require('electron').BrowserWindow;
                    var win = new BrowserWindow({ width: 550, height: 450 });
                    // Load a remote URL
                    win.loadURL("file://" + __dirname + "/static_popups/preferences.html");
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
                    var BrowserWindow = require('electron').BrowserWindow;
                    var win = new BrowserWindow({ width: 550, height: 550 });
                    // Load a remote URL
                    win.loadURL("file://" + __dirname + "/static_popups/runge-kutta-parameters.html");
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
//# sourceMappingURL=top-menu.js.map
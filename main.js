"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var path = require("path");
var url = require("url");
electron_1.app.setName("Minsky");
var top_menu_1 = require("./top-menu");
var top_menu_2 = require("./top-menu");
var storage = require('electron-json-storage');
var dialog = require('electron').dialog;
exports.win = null;
var storageBackgroundColor = "#c1c1c1";
var args = process.argv.slice(1), serve = args.some(function (val) { return val === '--serve'; });
function createWindow() {
    storage.get('backgroundColor', function (error, data) {
        if (error)
            throw error;
        storageBackgroundColor = data.color || "#c1c1c1";
        exports.win = prepareBrowserWindow(storageBackgroundColor);
        setTimeout(function () {
            top_menu_2.checkBackgroundAndApplyTextColor(storageBackgroundColor);
        }, 1500);
    });
    return exports.win;
}
exports.createWindow = createWindow;
function prepareBrowserWindow(color) {
    color = color || "#c1c1c1";
    var electronScreen = electron_1.screen;
    var size = electronScreen.getPrimaryDisplay().workAreaSize;
    exports.win = new electron_1.BrowserWindow({
        x: 0,
        y: 0,
        width: size.width,
        height: size.height,
        title: 'Minsky',
        webPreferences: {
            nodeIntegration: true,
            affinity: "window",
            allowRunningInsecureContent: (serve) ? true : false,
        },
        icon: __dirname + '/Icon/favicon.png'
    });
    exports.win.setBackgroundColor(color);
    exports.win.webContents.openDevTools();
    if (serve) {
        require('electron-reload')(__dirname, {
            electron: require(__dirname + "/node_modules/electron")
        });
        exports.win.loadURL('http://localhost:4200');
    }
    else {
        exports.win.loadURL(url.format({
            pathname: path.join(__dirname, 'dist/index.html'),
            protocol: 'file:',
            slashes: true
        }));
    }
    // Emitted when the window is closed.
    exports.win.on('closed', function () {
        // Dereference the window object, usually you would store window
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        exports.win = null;
    });
    exports.win.on('close', function (event) {
        event.preventDefault();
        var choice = dialog.showMessageBoxSync(exports.win, {
            type: 'question',
            buttons: ['Yes', 'No'],
            title: 'Confirm',
            message: 'Are you sure you want to quit?'
        });
        if (choice === 0) {
            exports.win.destroy();
        }
    });
    return exports.win;
}
try {
    electron_1.app.allowRendererProcessReuse = true;
    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    // Some APIs can only be used after this event occurs.
    // Added 400 ms to fix the black background issue while using transparent window. More detais at https://github.com/electron/electron/issues/15947
    electron_1.app.on('ready', function () {
        var menu = top_menu_1.template;
        addUpdateBookmarkList(menu);
        electron_1.Menu.setApplicationMenu(menu);
        setTimeout(createWindow, 400);
    });
    // Quit when all windows are closed.
    electron_1.app.on('window-all-closed', function () {
        // On OS X it is common for applications and their menu bar
        // to stay active until the user quits explicitly with Cmd + Q
        if (process.platform !== 'darwin') {
            electron_1.app.quit();
        }
    });
    electron_1.app.on('activate', function () {
        // On OS X it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (exports.win === null) {
            addUpdateBookmarkList(top_menu_1.template);
            createWindow();
        }
    });
}
catch (e) {
    // Catch Error
    // throw e;
}
function setStorageBackgroundColor(color) {
    storageBackgroundColor = color;
}
exports.setStorageBackgroundColor = setStorageBackgroundColor;
function getStorageBackgroundColor() {
    return storageBackgroundColor;
}
exports.getStorageBackgroundColor = getStorageBackgroundColor;
function addUpdateBookmarkList(mainMenu) {
    storage.get('bookmarks', function (error, data) {
        if (error)
            new Error('File not found or error selecting the file');
        if (data) {
            var outerSubMenu_1 = mainMenu.getMenuItemById('main-bookmark').submenu;
            var innerSubMenu_1 = outerSubMenu_1.getMenuItemById('delete-bookmark').submenu;
            outerSubMenu_1.append(new electron_1.MenuItem({ type: 'separator' }));
            data.forEach(function (ele) {
                outerSubMenu_1.append(new electron_1.MenuItem({
                    label: ele.title,
                    click: goToSelectedBookmark.bind(ele)
                }));
                innerSubMenu_1.append(new electron_1.MenuItem({
                    label: ele.title,
                    click: deleteBookmark.bind(ele)
                }));
            });
            electron_1.Menu.setApplicationMenu(mainMenu);
        }
        ;
    });
}
function goToSelectedBookmark() {
    exports.win.loadURL(this.url).catch(function (err) { throw new Error('Bookmarked url not found'); });
}
exports.goToSelectedBookmark = goToSelectedBookmark;
function deleteBookmark() {
    var _this = this;
    storage.get('bookmarks', function (error, data) {
        if (error)
            new Error('File not found');
        if (data) {
            var ind = data.findIndex(function (ele) { return ele.title === _this.title; });
            ind > -1 ? data.splice(ind, 1) : new Error("Bookmark Not Found");
            storage.set('bookmarks', data, function (error) { });
            var innerSubmenu = top_menu_1.template.getMenuItemById('main-bookmark').submenu.getMenuItemById('delete-bookmark').submenu.items;
            var outerSubmenu = top_menu_1.template.getMenuItemById('main-bookmark').submenu.items;
            var innerIdx = innerSubmenu.findIndex(function (ele) { return ele.label === _this.title; });
            var outerIdx = outerSubmenu.findIndex(function (ele) { return ele.label === _this.title; });
            innerSubmenu[innerIdx].visible = false;
            outerSubmenu[outerIdx].visible = false;
            // innerIdx > -1 ? innerSubmenu.splice(innerIdx, 1) : new Error("Bookmark Not Found");
        }
    });
}
exports.deleteBookmark = deleteBookmark;
//# sourceMappingURL=main.js.map
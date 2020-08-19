"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var path = require("path");
var url = require("url");
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
    electron_1.app.on('ready', function () { return __awaiter(void 0, void 0, void 0, function () {
        var menu;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    menu = top_menu_1.template;
                    return [4 /*yield*/, addBookmarkList(menu, 'list')];
                case 1:
                    _a.sent();
                    electron_1.Menu.setApplicationMenu(menu);
                    setTimeout(createWindow, 400);
                    return [2 /*return*/];
            }
        });
    }); });
    // Quit when all windows are closed.
    electron_1.app.on('window-all-closed', function () {
        // On OS X it is common for applications and their menu bar
        // to stay active until the user quits explicitly with Cmd + Q
        if (process.platform !== 'darwin') {
            electron_1.app.quit();
        }
    });
    electron_1.app.on('activate', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(exports.win === null)) return [3 /*break*/, 2];
                    return [4 /*yield*/, addBookmarkList(top_menu_1.template, 'list')];
                case 1:
                    _a.sent();
                    createWindow();
                    _a.label = 2;
                case 2: return [2 /*return*/];
            }
        });
    }); });
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
function addBookmarkList(mainMenu, purpose) {
    var foundMain = mainMenu.getMenuItemById('main-bookmark');
    storage.get('bookmarks', function (error, data) {
        if (error)
            new Error('File not found or error selecting the file');
        if (data) {
            data.forEach(function (ele) {
                console.log("____ELEL___", ele);
                var menuItem = new electron_1.MenuItem({
                    label: ele.title,
                    click: purpose === 'list' ? goToSelectedBookmark.bind(ele) : deleteBookmark.bind(ele)
                });
                foundMain.submenu.items.push(menuItem);
            });
            console.log("ITEMS_____", foundMain.submenu.items);
        }
        ;
    });
    return true;
}
function goToSelectedBookmark() {
    exports.win.loadURL(this.url);
    console.log('opened', this.urls);
}
function deleteBookmark() {
    console.log(this, 'deleted');
}
//# sourceMappingURL=main.js.map
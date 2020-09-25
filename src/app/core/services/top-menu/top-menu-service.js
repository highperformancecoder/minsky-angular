'use strict'
var __decorate =
	(this && this.__decorate) ||
	function (decorators, target, key, desc) {
		var c = arguments.length,
			r =
				c < 3
					? target
					: desc === null
					? (desc = Object.getOwnPropertyDescriptor(target, key))
					: desc,
			d
		if (
			typeof Reflect === 'object' &&
			typeof Reflect.decorate === 'function'
		)
			r = Reflect.decorate(decorators, target, key, desc)
		else
			for (var i = decorators.length - 1; i >= 0; i--)
				if ((d = decorators[i]))
					r =
						(c < 3
							? d(r)
							: c > 3
							? d(target, key, r)
							: d(target, key)) || r
		return c > 3 && r && Object.defineProperty(target, key, r), r
	}
var __metadata =
	(this && this.__metadata) ||
	function (k, v) {
		if (
			typeof Reflect === 'object' &&
			typeof Reflect.metadata === 'function'
		)
			return Reflect.metadata(k, v)
	}
Object.defineProperty(exports, '__esModule', { value: true })
var core_1 = require('@angular/core')
var electron_service_1 = require('../electron/electron.service')
var router_1 = require('@angular/router')
var path = require('path')
var url = require('url')
var main_js_1 = require('../../../../../main.js')
var TopMenuService = /** @class */ (function () {
	function TopMenuService(electronService, router) {
		var _this = this
		this.electronService = electronService
		this.router = router
		this.createMenuPopUp = function (
			width,
			height,
			title,
			dirPath,
			bgColor
		) {
			bgColor = bgColor
			var BrowserWindow = _this.electronService.remote.BrowserWindow
			var menuWindow = new BrowserWindow({
				width: width,
				height: height,
				title: title,
				resizable: false,
				minimizable: false,
				show: false,
				// parent: win,
				modal: true,
				backgroundColor: bgColor,
				webPreferences: {
					nodeIntegration: true,
				},
			})
			menuWindow.setMenu(null)
			menuWindow.loadURL('file://' + path.resolve('.') + dirPath)
			// console.log('file://' + __dirname + dirPath);
			menuWindow.once('ready-to-show', function () {
				menuWindow.show()
			})
			// menuWindow.webContents.openDevTools();
			menuWindow.on('closed', function () {
				menuWindow = null
			})
			// Closing global popup event_______
			_this.electronService.remote.ipcMain.on(
				'global-menu-popup:cancel',
				function (event) {
					if (menuWindow) {
						menuWindow.close()
					}
				}
			)
		}
	}
	TopMenuService.prototype.topMenu = function () {
		var remote = this.electronService.remote
		var createMenuPopUp = this.createMenuPopUp
		var template = this.electronService.remote.Menu.buildFromTemplate([
			{
				label: 'File',
				submenu: [
					{
						label: 'About Minsky',
						// It will open a child window when about menu is clicked.
						click: function () {
							createMenuPopUp(
								420,
								440,
								'',
								'/menu/file/about/about.html',
								'#ffffff'
							)
							remote.shell.beep()
						},
					},
					{
						label: 'Upgrade',
						click: function () {
							remote.shell.openExternal(
								'https://www.patreon.com/hpcoder'
							)
						},
					},
					{
						label: 'New System',
						accelerator: 'CmdOrCtrl + N',
						click: function () {
							main_js_1.win.hide()
							main_js_1.createWindow()
						},
					},
					{
						label: 'Open',
						accelerator: 'CmdOrCtrl + O',
						click: function () {
							// const files = dialog.showOpenDialog(win, {
							//   properties: ['openFile'],
							//   filters: [{ name: 'text', extensions: ['txt'] }]
							// });
							// files.then(result => {
							//   console.log(result.canceled)
							//   console.log(result.filePaths)
							//   console.log(fs.readFileSync(result.filePaths[0]).toString())
							// }).catch(err => {
							//   console.log("file is not selected")
							// })
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
						click: function () {
							remote.shell.openExternal(
								'https://github.com/highperformancecoder/minsky-models'
							)
						},
					},
					{
						label: 'Save',
						accelerator: 'CmdOrCtrl + S',
						click: function () {
							var content = 'This is the content of new file'
							// dialog.showSaveDialog(win, { filters: [{ name: 'text', extensions: ['txt'] }] }).
							//   then(result => {
							//     console.log(result)
							//     sendData(result);
							//     fs.writeFile(result.filePath, content, (err) => {
							//       if (err)
							//         console.log(err);
							//     })
							//   }).catch(err => {
							//     sendData("data error");
							//     console.log("file is not saved")
							//   })
						},
					},
					{
						label: 'SaveAs',
						accelerator: 'CmdOrCtrl + A',
					},
					{
						label: 'Insert File as Group',
						click: function () {
							// const files = remote.dialog.showOpenDialog(win, {
							//   properties: ['openFile', 'multiSelections'],
							//   filters: [{ name: 'text', extensions: ['txt'] }]
							// });
							// files.then(result => {
							//   console.log(result.canceled)
							//   console.log(result.filePaths)
							//   for (let file of result.filePaths) {
							//     console.log(fs.readFileSync(file).toString())
							//   }
							// }).catch(err => {
							//   console.log("file is not selected")
							// })
						},
					},
					{
						label: 'Dimensional Analysis',
						click: function () {
							createMenuPopUp(
								240,
								153,
								'',
								'/menu/file/dimensional-analysis/dimensional-analysis.html',
								'#ffffff'
							)
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
						click: function () {
							createMenuPopUp(
								250,
								500,
								'Log simulation',
								'/menu/file/log-simulation/log-simulation.html',
								null
							)
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
						click: function () {
							createMenuPopUp(
								400,
								230,
								'',
								'/menu/file/object-browser/object_browser.html',
								null
							)
						},
					},
					{
						label: 'Select items',
						click: function () {
							createMenuPopUp(
								290,
								153,
								'',
								'/menu/file/select-items/select_items.html',
								'#ffffff'
							)
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
						click: function () {
							createMenuPopUp(
								420,
								250,
								'Dimensions',
								'/menu/edit/dimensions/dimensions-popup.html',
								null
							)
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
						click: function () {
							createMenuPopUp(
								420,
								200,
								'Bookmark this position',
								'/menu/bookmark-position/bookmark-position.html',
								null
							)
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
								click: function () {
									createMenuPopUp(
										500,
										550,
										'Specify variable name',
										'/menu/create-variable/create-variable.html',
										null
									)
								},
							},
							{
								label: 'constant',
								click: function () {
									createMenuPopUp(
										500,
										550,
										'Specify variable name',
										'/menu/create-variable/create-variable.html',
										null
									)
								},
							},
							{
								label: 'parameter',
								click: function () {
									createMenuPopUp(
										500,
										550,
										'Specify variable name',
										'/menu/create-variable/create-variable.html',
										null
									)
								},
							},
						],
					},
					{
						label: 'Binary Ops',
						submenu: [
							{
								label: 'add',
								click: function () {
									console.log('add')
								},
							},
							{
								label: 'subtract',
								click: function () {},
							},
							{
								label: 'multiple',
								click: function () {},
							},
							{
								label: 'divide',
								click: function () {},
							},
							{
								label: 'min',
								click: function () {},
							},
							{
								label: 'max',
								click: function () {},
							},
							{
								label: 'and',
								click: function () {},
							},
							{
								label: 'or',
								click: function () {},
							},
							{
								label: 'log',
								click: function () {},
							},
							{
								label: 'pow',
								click: function () {},
							},
							{
								label: 'lt',
								click: function () {},
							},
							{
								label: 'le',
								click: function () {},
							},
							{
								label: 'eq',
								click: function () {},
							},
						],
					},
					{
						label: 'Functions',
						submenu: [
							{
								label: 'copy',
								click: function () {},
							},
							{
								label: 'sqrt',
								click: function () {},
							},
							{
								label: 'exp',
								click: function () {},
							},
							{
								label: 'ln',
								click: function () {},
							},
							{
								label: 'sin',
								click: function () {},
							},
							{
								label: 'cos',
								click: function () {},
							},
							{
								label: 'tan',
								click: function () {},
							},
							{
								label: 'asin',
								click: function () {},
							},
							{
								label: 'acos',
								click: function () {},
							},
							{
								label: 'atan',
								click: function () {},
							},
							{
								label: 'sinh',
								click: function () {},
							},
							{
								label: 'cosh',
								click: function () {},
							},
							{
								label: 'tanh',
								click: function () {},
							},
							{
								label: 'abs',
								click: function () {},
							},
							{
								label: 'floor',
								click: function () {},
							},
							{
								label: 'frac',
								click: function () {},
							},
							{
								label: 'not',
								click: function () {},
							},
						],
					},
					{
						label: 'Reductions',
						submenu: [
							{
								label: 'sum',
								click: function () {},
							},
							{
								label: 'product',
								click: function () {},
							},
							{
								label: 'infimum',
								click: function () {},
							},
							{
								label: 'supremum',
								click: function () {},
							},
							{
								label: 'any',
								click: function () {},
							},
							{
								label: 'all',
								click: function () {},
							},
							{
								label: 'infIndex',
								click: function () {},
							},
							{
								label: 'supIndex',
								click: function () {},
							},
						],
					},
					{
						label: 'Scans',
						submenu: [
							{
								label: 'runningSum',
								click: function () {},
							},
							{
								label: 'runningProduct',
								click: function () {},
							},
							{
								label: 'difference',
								click: function () {},
							},
						],
					},
					{
						label: 'Tensor operations',
						submenu: [
							{
								label: 'innerProduct',
								click: function () {},
							},
							{
								label: 'outerProduct',
								click: function () {},
							},
							{
								label: 'index',
								click: function () {},
							},
							{
								label: 'gather',
								click: function () {},
							},
						],
					},
					{
						label: 'time',
						click: function () {},
					},
					{
						label: 'integrate',
						click: function () {},
					},
					{
						label: 'differentiate',
						click: function () {},
					},
					{
						label: 'data',
						click: function () {},
					},
					{
						label: 'ravel',
						click: function () {},
					},
					{
						label: 'plot',
						click: function () {},
					},
				],
			},
			{
				label: 'Options',
				submenu: [
					{
						label: 'Preferences',
						click: function () {
							createMenuPopUp(
								550,
								450,
								'Preferences',
								'/menu/preferences/preferences.html',
								null
							)
						},
					},
					{
						label: 'Background Colour',
						click: function () {
							createMenuPopUp(
								450,
								320,
								'Background Colour',
								'/menu/options/background-color/background-color.html',
								null
							)
						},
					},
				],
			},
			{
				label: 'Runge Kutta',
				submenu: [
					{
						label: 'Runge Kutta',
						click: function () {
							createMenuPopUp(
								550,
								550,
								'Runge Kutta',
								'/menu/runge-kutta-parameters/runge-kutta-parameters.html',
								null
							)
						},
					},
				],
			},
			{
				role: 'help',
				submenu: [
					{
						label: 'Minsky Documentation',
						click: function () {
							remote.shell.openExternal(
								'https://minsky.sourceforge.io/manual/minsky.html'
							)
						},
					},
				],
			},
		])
		this.electronService.remote.Menu.setApplicationMenu(template)
	}
	TopMenuService = __decorate(
		[
			core_1.Injectable({
				providedIn: 'root',
			}),
			__metadata('design:paramtypes', [
				electron_service_1.ElectronService,
				router_1.ActivatedRoute,
			]),
		],
		TopMenuService
	)
	return TopMenuService
})()
exports.TopMenuService = TopMenuService
//# sourceMappingURL=top-menu-service.js.map

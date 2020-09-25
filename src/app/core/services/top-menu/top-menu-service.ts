import { Injectable } from '@angular/core'
import { ElectronService } from '../electron/electron.service'
import { ActivatedRoute } from '@angular/router'
const path = require('path')
import {
	win,
	getStorageBackgroundColor,
	setStorageBackgroundColor,
	createWindow,
	goToSelectedBookmark,
	deleteBookmark,
} from '../../../../../main.js'
import { app, MenuItem } from 'electron'
const { dialog } = require('electron').remote

@Injectable({
	providedIn: 'root',
})
export class TopMenuService {
	template: Electron.Menu
	menuWindow: Electron.BrowserWindow
	constructor(
		private electronService: ElectronService,
		private router: ActivatedRoute
	) {
		const storage = require('electron-json-storage')
		storage.setDataPath(
			(app || this.electronService.remote.app).getPath('userData')
		)
		const ipcRenderer = this.electronService.ipcRenderer

		ipcRenderer.on('background-color:ok', (event, data) => {
			storage.set('backgroundColor', { color: data.color })
			this.checkBackgroundAndApplyTextColor(data.color)
			setStorageBackgroundColor(data.color)
			this.menuWindow.close()
		})

		ipcRenderer.on('save-bookmark', (event, data) => {
			if (data) {
				storage.get(data.fileName, (error, fileData) => {
					if (error) throw error
					const dataToSave = {
						title: data.bookmarkTitle,
						url: win.webContents.getURL(),
					}
					fileData.push(dataToSave)
					// tslint:disable-next-line: no-shadowed-variable
					storage.set(data.fileName, fileData, (error) => {
						if (error) throw error
					})
					const outerSubMenu = this.template.getMenuItemById(
						'main-bookmark'
					).submenu
					const innerSubMenu = outerSubMenu.getMenuItemById(
						'delete-bookmark'
					).submenu
					outerSubMenu.append(
						new MenuItem({
							label: data.bookmarkTitle,
							click: goToSelectedBookmark.bind(dataToSave),
						})
					)
					innerSubMenu.append(
						new MenuItem({
							label: data.bookmarkTitle,
							click: deleteBookmark.bind(dataToSave),
						})
					)
					this.electronService.remote.Menu.setApplicationMenu(
						this.template
					)
					this.menuWindow.close()
				})
			}
		})
	}

	topMenu() {
		const remote = this.electronService.remote
		const fs = this.electronService.fs
		const createMenuPopUp = this.createMenuPopUp
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
							)
							remote.shell.beep()
						},
					},
					{
						label: 'Upgrade',
						click() {
							remote.shell.openExternal(
								'https://www.patreon.com/hpcoder'
							)
						},
					},
					{
						label: 'New System',
						accelerator: 'CmdOrCtrl + N',
						click() {
							win.hide()
							createWindow()
						},
					},
					{
						label: 'Open',
						accelerator: 'CmdOrCtrl + O',
						click() {
							const files = dialog.showOpenDialog({
								properties: ['openFile'],
								filters: [
									{ name: 'text', extensions: ['txt'] },
								],
							})
							files
								.then((result) => {
									console.log(result.canceled)
									console.log(result.filePaths)
									console.log(
										fs
											.readFileSync(result.filePaths[0])
											.toString()
									)
									this.openFunc(result)
								})
								.catch((err) => {
									console.log('file is not selected')
								})
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
							)
						},
					},
					{
						label: 'Save',
						accelerator: 'CmdOrCtrl + S',
						click() {
							const content = 'This is the content of new file'
							dialog
								.showSaveDialog({
									filters: [
										{ name: 'text', extensions: ['txt'] },
									],
								})
								.then((result) => {
									console.log(result)
									this.saveFunc(result)
									fs.writeFile(
										result.filePath,
										content,
										(err) => {
											if (err) console.log(err)
										}
									)
								})
								.catch((err) => {
									this.saveFunc('data error')
									console.log('file is not saved')
								})
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
								filters: [
									{ name: 'text', extensions: ['txt'] },
								],
							})
							files
								.then((result) => {
									console.log(result.canceled)
									console.log(result.filePaths)
									for (const file of result.filePaths) {
										console.log(
											fs.readFileSync(file).toString()
										)
									}
								})
								.catch((err) => {
									console.log('file is not selected')
								})
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
						click() {
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
						click() {
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
						click() {
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
						click() {
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
						click() {
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
								click() {
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
								click() {
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
								click() {
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
								click() {
									console.log('add')
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
							)
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
						click() {
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
						click() {
							remote.shell.openExternal(
								'https://minsky.sourceforge.io/manual/minsky.html'
							)
						},
					},
				],
			},
		])
		this.electronService.remote.Menu.setApplicationMenu(this.template)
		// this.electronService.ipcRenderer.send('minsky-menu',template)
	}

	createMenuPopUp = (width, height, title, dirPath, bgColor) => {
		bgColor = bgColor || getStorageBackgroundColor()
		const BrowserWindow = this.electronService.remote.BrowserWindow
		this.menuWindow = new BrowserWindow({
			width,
			height,
			title,
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
		this.menuWindow.setMenu(null)
		this.menuWindow.loadURL('file://' + path.resolve('.') + dirPath)

		this.menuWindow.once('ready-to-show', () => {
			this.menuWindow.show()
		})
		// menuWindow.webContents.openDevTools();
		this.menuWindow.on('closed', () => {
			this.menuWindow = null
		})
		// Closing global popup event_______
		this.electronService.remote.ipcMain.on(
			'global-menu-popup:cancel',
			(event) => {
				if (this.menuWindow) {
					this.menuWindow.close()
				}
			}
		)
	}

	checkBackgroundAndApplyTextColor(color) {
		// Variables for red, green, blue values

		let colorArray
		// tslint:disable-next-line: one-variable-per-declaration
		let r, g, b, hsp

		// Check the format of the color, HEX or RGB?
		if (color.match(/^rgb/)) {
			// If RGB --> store the red, green, blue values in separate variables
			colorArray = color.match(
				/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/
			)

			r = color[1]
			g = color[2]
			b = color[3]
		} else {
			// If hex --> Convert it to RGB: http://gist.github.com/983661
			colorArray = +(
				'0x' + color.slice(1).replace(color.length < 5 && /./g, '$&$&')
			)

			// tslint:disable-next-line: no-bitwise
			r = colorArray >> 16
			// tslint:disable-next-line: no-bitwise
			g = (colorArray >> 8) & 255
			// tslint:disable-next-line: no-bitwise
			b = colorArray & 255
		}

		// HSP (Highly Sensitive Poo) equation from http://alienryderflex.com/hsp.html
		hsp = Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b))

		// Using the HSP value, determine whether the color is light or dark
		if (hsp > 127.5) {
			const css =
				'body { background-color: ' + color + '; color: black; }'
			this.applyCssToBackground(css)
		} else {
			const css =
				'body { background-color: ' + color + '; color: white; }'
			this.applyCssToBackground(css)
		}
	}
	applyCssToBackground(css) {
		win.webContents.insertCSS(css)
	}

	openFunc(data) {
		win.webContents.send('Open_file', data)
	}
	saveFunc(data) {
		win.webContents.send('Save_file', data)
	}
}

import * as path from 'path'
import * as url from 'url'

import {
	app,
	BrowserWindow,
	screen,
	Menu,
	MenuItem,
	dialog,
	ipcMain,
} from 'electron'

// import { template } from './src/app/core/services/top-menu/top-menu-service'
const env = process.env.NODE_ENV || 'development'

const storage = require('electron-json-storage')
export let win: BrowserWindow = null
let storageBackgroundColor = '#c1c1c1'
const args = process.argv.slice(1)
const serve = args.some((val) => val === '--serve')

export function createWindow(): BrowserWindow {
	storage.get('backgroundColor', (error, data) => {
		if (error) throw error
		storageBackgroundColor = data.color || '#c1c1c1'
		win = prepareBrowserWindow(storageBackgroundColor)
		setTimeout(() => {
			// ToDo backgroundColor saving
			checkBackgroundAndApplyTextColor(storageBackgroundColor)
		}, 1500)
	})
	return win
}

function prepareBrowserWindow(color) {
	app.setName('Minsky')
	color = color || '#c1c1c1'
	const electronScreen = screen
	const size = electronScreen.getPrimaryDisplay().workAreaSize
	win = new BrowserWindow({
		x: 0,
		y: 0,
		width: size.width,
		height: size.height,
		title: 'Minsky',
		webPreferences: {
			nodeIntegration: true,
			affinity: 'window',
			allowRunningInsecureContent: serve ? true : false,
		},
		icon: __dirname + '/Icon/favicon.png',
	})
	win.setBackgroundColor(color)
	win.webContents.openDevTools()

	if (serve) {
		require('electron-reload')(__dirname, {
			electron: require(`${__dirname}/node_modules/electron`),
		})
		win.loadURL('http://localhost:4200')
	} else {
		win.loadURL(
			url.format({
				pathname: path.join(__dirname, 'dist/index.html'),
				protocol: 'file:',
				slashes: true,
			})
		)
	}

	// Emitted when the window is closed.
	win.on('closed', () => {
		// Dereference the window object, usually you would store window
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.

		win = null
	})
	win.on('close', (event) => {
		event.preventDefault()
		const choice = dialog.showMessageBoxSync(win, {
			type: 'question',
			buttons: ['Yes', 'No'],
			title: 'Confirm',
			message: 'Are you sure you want to quit?',
		})

		if (choice === 0) {
			win.destroy()
		}
	})
	return win
}

try {
	app.allowRendererProcessReuse = true

	// This method will be called when Electron has finished
	// initialization and is ready to create browser windows.
	// Some APIs can only be used after this event occurs.
	// tslint:disable-next-line: max-line-length
	// Added 400 ms to fix the black background issue while using transparent window.More details at https://github.com/electron/electron/issues/15947.
	app.on('ready', () => {
		// ToDo saving
		// const menu = template
		// addUpdateBookmarkList(menu)
		// Menu.setApplicationMenu(menu)
		setTimeout(createWindow, 400)
		storage.setDataPath(app.getPath('userData'))

		ipcMain.on('save-bookmark', (event, data) => {
			if (data) {
				const menu = Menu.getApplicationMenu()
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
					const outerSubMenu = menu.getMenuItemById('main-bookmark')
						.submenu
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
					Menu.setApplicationMenu(menu)
					// menuWindow.close()
				})
			}
			event.reply('bookmark-done-reply')
		})
		ipcMain.on('background-color:ok', (event, data) => {
			storage.set('backgroundColor', { color: data.color })
			checkBackgroundAndApplyTextColor(data.color)
			setStorageBackgroundColor(data.color)
			event.reply('background-color:ok-reply')
		})

		ipcMain.on('create-new-window', (event, data) => {
			console.log(data)
			const { width, height, title, dirPath, bgColor } = data
			createMenuPopUp(width, height, title, dirPath, bgColor)
		})
		ipcMain.on('ready-template', (event) => {
			addUpdateBookmarkList(Menu.getApplicationMenu())
		})
	})

	// Quit when all windows are closed.
	app.on('window-all-closed', () => {
		// On OS X it is common for applications and their menu bar
		// to stay active until the user quits explicitly with Cmd + Q
		if (process.platform !== 'darwin') {
			app.quit()
		}
	})

	app.on('activate', () => {
		// On OS X it's common to re-create a window in the app when the
		// dock icon is clicked and there are no other windows open.
		if (win === null) {
			// ToDo
			createWindow()
		}
	})
} catch (e) {
	// Catch Error
	// throw e;
}

// If development environment
if (env === 'development') {
	try {
		require('electron-reloader')(module, {
			debug: true,
			watchRenderer: true,
		})
	} catch (_) {
		console.log('Error')
	}
}

export function setStorageBackgroundColor(color) {
	storageBackgroundColor = color
}
export function getStorageBackgroundColor() {
	return storageBackgroundColor
}

function addUpdateBookmarkList(mainMenu: Menu) {
	storage.get('bookmarks', (error, data: [{ title: string; click: any }]) => {
		// tslint:disable-next-line: no-unused-expression
		if (error) new Error('File not found or error selecting the file')
		if (data) {
			const outerSubMenu = mainMenu.getMenuItemById('main-bookmark')
				.submenu
			const innerSubMenu = outerSubMenu.getMenuItemById('delete-bookmark')
				.submenu

			outerSubMenu.append(new MenuItem({ type: 'separator' }))
			if (Array.isArray(data)) {
				data.forEach((ele) => {
					outerSubMenu.append(
						new MenuItem({
							label: ele.title,
							click: goToSelectedBookmark.bind(ele),
						})
					)
					innerSubMenu.append(
						new MenuItem({
							label: ele.title,
							click: deleteBookmark.bind(ele),
						})
					)
				})
			}
			Menu.setApplicationMenu(mainMenu)
		}
	})
}

export function goToSelectedBookmark() {
	win.loadURL(this.url).catch((err) => {
		throw new Error('Bookmarked url not found')
	})
}
export function deleteBookmark() {
	storage.get('bookmarks', (error, data: [{ title: string; click: any }]) => {
		// tslint:disable-next-line: no-unused-expression
		if (error) new Error('File not found')
		if (data) {
			const ind = data.findIndex((ele) => ele.title === this.title)
			// tslint:disable-next-line: no-unused-expression
			ind > -1 ? data.splice(ind, 1) : new Error('Bookmark Not Found')
			// tslint:disable-next-line: no-shadowed-variable
			storage.set('bookmarks', data, (error) => {
				console.log(error)
			})
			win.webContents.send('refresh-menu')

			// ToDo add code to delete bookmark

			/* const innerSubmenu = template
				.getMenuItemById('main-bookmark')
				.submenu.getMenuItemById('delete-bookmark').submenu.items
			const outerSubmenu = template.getMenuItemById('main-bookmark')
				.submenu.items
			const innerIdx = innerSubmenu.findIndex(
				(ele) => ele.label === this.title
			)
			const outerIdx = outerSubmenu.findIndex(
				(ele) => ele.label === this.title
			)
			innerSubmenu[innerIdx].visible = false
			outerSubmenu[outerIdx].visible = false */

			// innerIdx > -1 ? innerSubmenu.splice(innerIdx, 1) : new Error("Bookmark Not Found");
		}
	})
}

function checkBackgroundAndApplyTextColor(color) {
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
		const css = 'body { background-color: ' + color + '; color: black; }'
		applyCssToBackground(css)
	} else {
		const css = 'body { background-color: ' + color + '; color: white; }'
		applyCssToBackground(css)
	}
}
function applyCssToBackground(css) {
	win.webContents.insertCSS(css)
}

// this function open new popup window
function createMenuPopUp(width, height, title, dirPath, menuBackgroundColor) {
	menuBackgroundColor = menuBackgroundColor || getStorageBackgroundColor()
	// tslint:disable-next-line: no-shadowed-variable
	const BrowserWindow = require('electron').BrowserWindow
	let menuWindow = new BrowserWindow({
		width,
		height,
		title,
		resizable: false,
		minimizable: false,
		show: false,
		parent: win,
		modal: true,
		backgroundColor: menuBackgroundColor,
		webPreferences: {
			nodeIntegration: true,
		},
	})
	menuWindow.setMenu(null)
	menuWindow.loadURL('file://' + __dirname + dirPath)

	menuWindow.once('ready-to-show', () => {
		menuWindow.show()
	})
	// menuWindow.webContents.openDevTools();      // command to inspect popup
	menuWindow.on('closed', () => {
		menuWindow = null
	})
	// Closing global popup event_______
	ipcMain.on('global-menu-popup:cancel', (event) => {
		if (menuWindow) {
			menuWindow.close()
		}
	})
}

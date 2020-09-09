import * as path from 'path'
import * as url from 'url'

import { app, BrowserWindow, screen, Menu, MenuItem, dialog } from 'electron'

import { checkBackgroundAndApplyTextColor, template } from './top-menu'

app.setName('Minsky')
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
			checkBackgroundAndApplyTextColor(storageBackgroundColor)
		}, 1500)
	})
	return win
}

function prepareBrowserWindow(color) {
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
		const menu = template
		addUpdateBookmarkList(menu)
		Menu.setApplicationMenu(menu)
		setTimeout(createWindow, 400)
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
			addUpdateBookmarkList(template)
			createWindow()
		}
	})
} catch (e) {
	// Catch Error
	// throw e;
}

export function getWindowSize() {
	const handle = win.getNativeWindowHandle().readUInt32LE(0)
	// console.log(`nativeWindowHandle: ${handle.toString(16)}`)
	return handle.toString(16)
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

			const innerSubmenu = template
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
			outerSubmenu[outerIdx].visible = false
			// innerIdx > -1 ? innerSubmenu.splice(innerIdx, 1) : new Error("Bookmark Not Found");
		}
	})
}

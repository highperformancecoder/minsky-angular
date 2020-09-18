import { Component, ChangeDetectorRef } from '@angular/core'
import { ElectronService } from './core/services'
import { TranslateService } from '@ngx-translate/core'
import { AppConfig } from '../environments/environment'
import { CommunicationService } from './communication.service'
// Import the resized event model
import { ResizedEvent } from 'angular-resize-event'

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss'],
})
export class AppComponent {
	loader = false
	directory: string[]
	openFileDirectory: any

	constructor(
		private electronService: ElectronService,
		private cmService: CommunicationService,
		private translate: TranslateService,
		private cdr: ChangeDetectorRef
	) {
		this.translate.setDefaultLang('en')
		console.log('AppConfig', AppConfig)

		if (electronService.isElectron) {
			console.log(process.env)
			console.log('Run in electron')
			console.log(
				'Electron ipcRenderer',
				this.electronService.ipcRenderer
			)
			console.log(
				'NodeJS childProcess',
				this.electronService.childProcess
			)
		} else {
			console.log('Run in browser')
		}
		this.openFile()
		this.saveFile()
		this.windowDetails()
		this.windowSize()
		this.cmService.canvasOffsetValues()
	}

	ngOnInit() {
		console.log('ng init')
	}

	windowDetails() {
		// code for X11 window
		const winHandle = require('electron')
			.remote.getCurrentWindow()
			.getNativeWindowHandle()

		// code to convert buffer element to string where 0 will be replaced with each array element
		/* const winHandle = require('electron')
			.remote.getCurrentWindow()
			.getNativeWindowHandle().readUInt32LE(0).toString(16) */
		console.log(winHandle)
		this.emitData(winHandle)
	}

	windowSize() {
		// code for window size
		const windowDetail = {
			width: window.innerWidth,
			height: window.innerHeight,
		}
		console.log(
			'width:' + window.innerWidth + ' ' + 'height:' + window.innerHeight
		)
		this.emitData(windowDetail)
	}

	windowResize(event: ResizedEvent) {
		const windowResizeDetail = {
			resizeWidth: event.newWidth,
			resizeHeight: event.newHeight,
		}
		console.log(
			'resizeWidth:' +
				event.newWidth +
				' ' +
				'resizeHeight:' +
				event.newWidth
		)
		this.cmService.canvasOffsetValues()
		this.emitData(windowResizeDetail)
	}

	saveFile() {
		this.cmService.directory.subscribe((value) => {
			this.directory = value
			// console.log(this.directory)
			this.emitData(this.directory)
		})
	}

	openFile() {
		this.cmService.openDirectory.subscribe((value) => {
			this.openFileDirectory = value
			// console.log(this.openFileDirectory)
			this.emitData(this.openFileDirectory)
		})
	}

	emitData(data) {
		this.cmService.emitValues('Values', data)
		this.cmService.dispatchEvents('Values')
	}
}

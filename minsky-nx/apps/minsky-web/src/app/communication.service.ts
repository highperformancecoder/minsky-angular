import { Injectable } from '@angular/core'
import { Observable, BehaviorSubject } from 'rxjs'
import { Socket } from 'ngx-socket-io'
import { ElectronService } from './core/services/electron/electron.service'

export class Message {
	id: string
	body: string
}

@Injectable({
	providedIn: 'root',
})
export class CommunicationService {
	canvasDetail: HTMLElement
	sticky: number
	leftOffset: number
	topOffset: number
	offSetValue: string
	directory = new BehaviorSubject<string[]>([])
	openDirectory = new BehaviorSubject<string[]>([])
	constructor(
		private socket: Socket,
		private electronService: ElectronService
	) {
		this.electronService.ipcRenderer.on('Save_file', (event, result) => {
			this.directory.next(result)
		})

		this.electronService.ipcRenderer.on('Open_file', (event, result) => {
			this.openDirectory.next(result)
		})
	}

	public emitValues(message, data) {
		this.socket.emit(message, data)
	}

	public sendEvent(event, message) {
		this.socket.emit(event, message)
	}

	public mouseEvents(eventName, event) {
		const clickData = {
			type: event.type,
			clientX: event.clientX,
			clientY: event.clientY,
		}
		this.socket.emit(eventName, clickData)
	}

	public dispatchEvents(eventName) {
		this.socket.on(eventName, (data) => {
			// common code for dispatch events
			console.log('Event received', data)
			document.querySelector(data.id).dispatchEvent(data.event)
		})
	}

	public getMessages = () => {
		return new Observable((observer) => {
			this.socket.on('RESPONSE', (message) => {
				observer.next(message)
				console.log(message)
			})
		})
	}

	canvasOffsetValues() {
		// code for canvas offset values
		document.addEventListener('DOMContentLoaded', () => {
			// When the event DOMContentLoaded occurs, it is safe to access the DOM

			window.addEventListener('scroll', this.canvasSticky)
			this.canvasDetail = document.getElementById('offsetValue')

			// Get the offset position of the canvas
			this.topOffset = this.canvasDetail.offsetTop
			this.leftOffset = this.canvasDetail.offsetLeft
			this.offSetValue =
				'top:' + this.topOffset + ' ' + 'left:' + this.leftOffset

			this.emitValues('Values', this.offSetValue)
		})

		this.dispatchEvents('Values')
	}

	canvasSticky() {
		if (window.pageYOffset >= this.sticky) {
			console.log('window.pageYOffset >= sticky')
		} else {
			console.log('Not window.pageYOffset >= sticky')
		}
		if (window.pageYOffset >= this.sticky) {
			this.canvasDetail.classList.add('sticky')
		} else {
			this.canvasDetail.classList.remove('sticky')
		}
	}
}

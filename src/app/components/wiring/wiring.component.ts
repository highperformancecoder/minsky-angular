import { Component, OnInit } from '@angular/core'
import { Socket } from 'ngx-socket-io'
import { CommunicationService } from '../../communication.service'

@Component({
	selector: 'app-wiring',
	templateUrl: './wiring.component.html',
	styleUrls: ['./wiring.component.scss'],
})
export class WiringComponent implements OnInit {
	newMessage: string
	messageList: string[] = []
	canvasDetail: HTMLElement
	sticky: number
	leftOffset: number
	topOffset: number
	offSetValue: string
	constructor(
		private cmService: CommunicationService,
		private socket: Socket
	) {
		document.addEventListener('click', (event) => {
			this.cmService.mouseEvents('canvasEvent', event)
		})

		document.addEventListener('mousedown', (event) => {
			this.cmService.mouseEvents('canvasEvent', event)
		})

		document.addEventListener('mouseup', (event) => {
			this.cmService.mouseEvents('canvasEvent', event)
		})

		document.addEventListener('mousemove', (event) => {
			this.cmService.mouseEvents('canvasEvent', event)
		})

		this.socket.on('canvasEvent', (data) => {
			// common code for mouse events
			console.log('event received', data)
			document.querySelectorAll(data.id).dispatchEvent(data.event)
		})

		this.windowDetails()
	}

	windowDetails() {
		// code for X11 window
		const winSize = require('electron')
			.remote.getCurrentWindow()
			.getNativeWindowHandle()
			.readUInt32LE(0)
			.toString(16)

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
			console.log('value' + this.offSetValue)
			this.socket.emit('Values', this.offSetValue)
		})

		this.socket.on('Values', (data) => {
			// common code for mouse events
			console.log('offset value for top/left', data)
			document.querySelectorAll(data.id).dispatchEvent(data.event)
		})

		// code for window size
		const screen = window.screen
		console.log(winSize, screen)
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

	sendMessage() {
		this.cmService.sendMessage(this.newMessage)
		this.newMessage = ''
	}

	ngOnInit() {
		this.cmService.getMessages().subscribe((message: string) => {
			this.messageList.push(message)
		})
	}
}

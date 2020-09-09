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

		this.cmService.dispatchEvents('canvasEvent')

		this.canvasOffsetValues()
		this.canvasWindowSize()
		this.windowDetails()
	}

	ngOnInit() {
		this.cmService.getMessages().subscribe((message: string) => {
			this.messageList.push(message)
		})
	}

	canvasWindowSize() {
		// code for canvas window size
		const screen = window.screen
		console.log(screen)
	}

	windowDetails() {
		// code for X11 window
		const winSize = require('electron')
			.remote.getCurrentWindow()
			.getNativeWindowHandle()
			.readUInt32LE(0)
			.toString(16)
		console.log(winSize)
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
			console.log('value: ' + this.offSetValue)

			this.cmService.sendOffset('Values', this.offSetValue)
		})

		this.cmService.dispatchEvents('Values')
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

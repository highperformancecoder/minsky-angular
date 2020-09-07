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

	constructor(
		private cmService: CommunicationService,
		private socket: Socket
	) {
		document.addEventListener('click', (event) => {
			const clickData = {
				type: event.type,
				clientX: event.clientX,
				clientY: event.clientY,
			}
			this.socket.emit('canvasEvent', clickData)
		})

		document.addEventListener('mousedown', (event) => {
			const clickData = {
				type: event.type,
				clientX: event.clientX,
				clientY: event.clientY,
			}
			this.socket.emit('canvasEvent', clickData)
		})

		document.addEventListener('mouseup', (event) => {
			const clickData = {
				type: event.type,
				clientX: event.clientX,
				clientY: event.clientY,
			}
			this.socket.emit('canvasEvent', clickData)
		})

		document.addEventListener('mousemove', (event) => {
			const clickData = {
				type: event.type,
				clientX: event.clientX,
				clientY: event.clientY,
			}
			this.socket.emit('canvasEvent', clickData)
		})

		this.socket.on('canvasEvent', (data) => {
			// common code for mouse events
			console.log('event received', data)
			document.querySelectorAll(data.id).dispatchEvent(data.event)
		})
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

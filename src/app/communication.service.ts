import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import { Socket } from 'ngx-socket-io'

export class Message {
	id: string
	body: string
}

@Injectable({
	providedIn: 'root',
})
export class CommunicationService {
	constructor(private socket: Socket) {}

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
			console.log('event received', data)
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
}

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

	public sendMessage(message) {
		this.socket.emit('new-message', message)
	}

	public sendEvent(event, message) {
		this.socket.emit(event, message)
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

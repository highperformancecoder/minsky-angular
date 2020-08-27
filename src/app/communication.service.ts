import { Injectable } from '@angular/core'
import { Socket } from 'ngx-socket-io'
import { Observable } from 'rxjs'

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

	public getMessages = () => {
		// tslint:disable-next-line: deprecation
		return Observable.create((observer) => {
			this.socket.on('new-message', (message) => {
				observer.next(message)
			})
		})
	}
}

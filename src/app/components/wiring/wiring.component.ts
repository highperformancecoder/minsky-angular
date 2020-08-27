import { Component, OnInit } from '@angular/core'
import { CommunicationService } from '../../communication.service'

@Component({
	selector: 'app-wiring',
	templateUrl: './wiring.component.html',
	styleUrls: ['./wiring.component.scss'],
})
export class WiringComponent implements OnInit {
	newMessage: string
	messageList: string[] = []

	constructor(private cmService: CommunicationService) {}

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

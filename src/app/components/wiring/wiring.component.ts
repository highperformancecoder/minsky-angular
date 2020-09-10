import { Component, OnInit } from '@angular/core'
import { CommunicationService } from '../../communication.service'

@Component({
	selector: 'app-wiring',
	templateUrl: './wiring.component.html',
	styleUrls: ['./wiring.component.scss'],
})
export class WiringComponent implements OnInit {
	messageList: string[] = []
	constructor(private cmService: CommunicationService) {
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
	}

	ngOnInit() {
		this.cmService.getMessages().subscribe((message: string) => {
			this.messageList.push(message)
		})
	}
}

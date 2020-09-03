import { Component, OnInit } from '@angular/core'

import { CommunicationService } from './../../communication.service'

interface HeaderEvent {
	action: string
	target: string
}

@Component({
	selector: 'app-header',
	templateUrl: './header.component.html',
	styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
	HEADER_EVENT = 'HEADER_EVENT'
	constructor(private commService: CommunicationService) {}

	ngOnInit() {}

	buttonClicked() {
		// this.commService
	}

	recordButton() {
		this.commService.sendEvent(this.HEADER_EVENT, {
			action: 'CLICKED',
			target: 'RECORD_BUTTON',
		})
		console.log('recordButtonssss')
	}
	recordingReplyButton() {
		console.log('recordingReplyButton')
	}
	reveerseCheckboxButton() {
		console.log('reveerseCheckboxButton')
	}
	playButton() {
		console.log('playButton')
	}
	stopButton() {
		console.log('stopButton')
	}
	resetButton() {
		console.log('resetButton')
	}
	stepButton() {
		console.log('stepbutton')
	}
	zoomOutButton() {
		console.log('zoomOutButton')
	}
	zoomInButton() {
		console.log('zoomInButton')
	}
	resetZoomButton() {
		console.log('resetZoomButton')
	}
	zoomTofitButton() {
		console.log('zoomTofitButton ')
	}
	simulationSpeed(value) {
		console.log('simulation speed', value)
	}
}

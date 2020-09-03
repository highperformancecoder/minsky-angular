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
		console.log('recordButtons')
	}
	recordingReplyButton() {
		this.commService.sendEvent(this.HEADER_EVENT, {
			action: 'CLICKED',
			target: 'RECORDING_REPLAY_BUTTON',
		})
		console.log('recordingReplyButton')
	}
	reverseCheckboxButton() {
		this.commService.sendEvent(this.HEADER_EVENT, {
			action: 'CLICKED',
			target: 'REVERSE_CHECKBOX_BUTTON',
		})
		console.log('reverseCheckboxButton')
	}
	playButton() {
		this.commService.sendEvent(this.HEADER_EVENT, {
			action: 'CLICKED',
			target: 'PLAY_BUTTON',
		})
		console.log('playButton')
	}
	stopButton() {
		this.commService.sendEvent(this.HEADER_EVENT, {
			action: 'CLICKED',
			target: 'STOP_BUTTON',
		})
		console.log('stopButton')
	}
	resetButton() {
		this.commService.sendEvent(this.HEADER_EVENT, {
			action: 'CLICKED',
			target: 'RESET_BUTTON',
		})
		console.log('resetButton')
	}
	stepButton() {
		this.commService.sendEvent(this.HEADER_EVENT, {
			action: 'CLICKED',
			target: 'STEP_BUTTON',
		})
		console.log('stepbutton')
	}
	zoomOutButton() {
		this.commService.sendEvent(this.HEADER_EVENT, {
			action: 'CLICKED',
			target: 'ZOOMOUT_BUTTON',
		})
		console.log('zoomOutButton')
	}
	zoomInButton() {
		this.commService.sendEvent(this.HEADER_EVENT, {
			action: 'CLICKED',
			target: 'ZOOMIN_BUTTON',
		})
		console.log('zoomInButton')
	}
	resetZoomButton() {
		this.commService.sendEvent(this.HEADER_EVENT, {
			action: 'CLICKED',
			target: 'RESETZOOM_BUTTON',
		})
		console.log('resetZoomButton')
	}
	zoomTofitButton() {
		this.commService.sendEvent(this.HEADER_EVENT, {
			action: 'CLICKED',
			target: 'ZOOMTOFIT_BUTTON',
		})
		console.log('zoomTofitButton ')
	}
	simulationSpeed(value) {
		this.commService.sendEvent(this.HEADER_EVENT, {
			action: 'CLICKED',
			target: 'SIMULATION_SPEED',
		})
		console.log('simulation speed', value)
	}
}

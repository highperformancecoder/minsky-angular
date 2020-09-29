import { Component, OnInit } from '@angular/core'
import { ElectronService } from '../../../../core/services'

@Component({
	selector: 'app-background-color',
	templateUrl: './background-color.component.html',
	styleUrls: ['./background-color.component.scss'],
})
export class BackgroundColorComponent implements OnInit {
	color = '#c1c1c1'
	electron = require('electron')
	storage = require('electron-json-storage')

	constructor(private eleService: ElectronService) {
		this.storage.setDataPath(
			(this.electron.app || this.electron.remote.app).getPath('userData')
		)
		this.storage.get('backgroundColor', (error, data) => {
			if (error) throw error
			if (data.color !== undefined) {
				this.color = data.color
			}
		})
	}

	ngOnInit(): void {}

	onClickOk() {
		/*  const selectedClrCode = $('#color-picker').spectrum('get')
			const data = {
			color: selectedClrCode.toHexString(),
		} */
		// this.eleService.ipcRenderer.send('background-color:ok', data)
		this.eleService.ipcRenderer.on(
			'background-color:ok-reply',
			(event, arg) => {
				this.close()
			}
		)
	}

	close() {
		this.eleService.ipcRenderer.send('global-menu-popup:cancel')
	}
}

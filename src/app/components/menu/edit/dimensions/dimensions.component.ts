import { Component, OnInit } from '@angular/core'
import { ElectronService } from '../../../../core/services'

@Component({
	selector: 'app-dimensions',
	templateUrl: './dimensions.component.html',
	styleUrls: ['./dimensions.component.scss'],
})
export class DimensionsComponent implements OnInit {
	constructor(private electronService: ElectronService) {}

	ngOnInit(): void {}
	submitBtn() {
		this.electronService.ipcRenderer.send('global-menu-popup:cancel')
	}
	cancelBtn() {
		this.electronService.ipcRenderer.send('global-menu-popup:cancel')
	}
}

import { Component, OnInit } from '@angular/core'
import { ElectronService } from '../../../../core/services'

@Component({
	selector: 'app-about',
	templateUrl: './about.component.html',
	styleUrls: ['./about.component.scss'],
})
export class AboutComponent implements OnInit {
	constructor(private electronService: ElectronService) {}

	ngOnInit(): void {}

	aboutFunc() {
		console.log('button clicked')
		this.electronService.ipcRenderer.send('global-menu-popup:cancel')
	}
}

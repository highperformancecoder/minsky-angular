import { Component, OnInit } from '@angular/core'
import { ElectronService } from '../../../core/services'

@Component({
	selector: 'app-preferences',
	templateUrl: './preferences.component.html',
	styleUrls: ['./preferences.component.scss'],
})
export class PreferencesComponent implements OnInit {
	constructor(private electronService: ElectronService) {}

	ngOnInit(): void {
		document.querySelector('.cancel-btn').addEventListener('click', () => {
			this.electronService.ipcRenderer.send('global-menu-popup:cancel')
		})
	}
}

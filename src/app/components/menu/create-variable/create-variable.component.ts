import { Component, OnInit } from '@angular/core'
import { ElectronService } from '../../../core/services'

@Component({
	selector: 'app-create-variable',
	templateUrl: './create-variable.component.html',
	styleUrls: ['./create-variable.component.scss'],
})
export class CreateVariableComponent implements OnInit {
	constructor(private electronService: ElectronService) {}

	ngOnInit(): void {
		document
			.getElementById('createVariableOk')
			.addEventListener('click', () => {
				console.log('button clicked')
				this.electronService.ipcRenderer.send('create-variable:ok', '')
			})
		document.querySelector('.cancel-btn').addEventListener('click', () => {
			this.electronService.ipcRenderer.send('global-menu-popup:cancel')
		})
	}
}

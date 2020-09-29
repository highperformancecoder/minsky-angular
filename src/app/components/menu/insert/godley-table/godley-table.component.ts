import { Component, OnInit } from '@angular/core'
import { ElectronService } from '../../../../core/services'

@Component({
	selector: 'app-godley-table',
	templateUrl: './godley-table.component.html',
	styleUrls: ['./godley-table.component.scss'],
})
export class GodleyTableComponent implements OnInit {
	constructor(private electronService: ElectronService) {}

	ngOnInit(): void {
		document
			.getElementById('godleyTableOk')
			.addEventListener('click', () => {
				console.log('button clicked')
				this.electronService.ipcRenderer.send('godley-table:ok', '')
			})
		document.querySelector('.cancel-btn').addEventListener('click', () => {
			this.electronService.ipcRenderer.send('global-menu-popup:cancel')
		})
	}
}

import { Component, OnInit } from '@angular/core'
import { ElectronService } from '../../../../core/services'

@Component({
	selector: 'app-dimensional-analysis',
	templateUrl: './dimensional-analysis.component.html',
	styleUrls: ['./dimensional-analysis.component.scss'],
})
export class DimensionalAnalysisComponent implements OnInit {
	constructor(private electronService: ElectronService) {}

	ngOnInit(): void {
		document.querySelector('button').addEventListener('click', () => {
			this.electronService.ipcRenderer.send('global-menu-popup:cancel')
		})
	}
}

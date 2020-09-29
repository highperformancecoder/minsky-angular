import { Component, OnInit } from '@angular/core'
import { ElectronService } from '../../../core/services'

@Component({
	selector: 'app-runge-kutta-parameters',
	templateUrl: './runge-kutta-parameters.component.html',
	styleUrls: ['./runge-kutta-parameters.component.scss'],
})
export class RungeKuttaParametersComponent implements OnInit {
	constructor(private electronService: ElectronService) {}

	ngOnInit(): void {
		document.querySelector('.cancel-btn').addEventListener('click', () => {
			this.electronService.ipcRenderer.send('global-menu-popup:cancel')
		})
	}
}

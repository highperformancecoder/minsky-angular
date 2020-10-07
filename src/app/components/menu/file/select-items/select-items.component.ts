import { Component, OnInit } from '@angular/core'
import { ElectronService } from '../../../../core/services'

@Component({
	selector: 'app-select-items',
	templateUrl: './select-items.component.html',
	styleUrls: ['./select-items.component.scss'],
})
export class SelectItemsComponent implements OnInit {
	constructor(private electronService: ElectronService) {}

	ngOnInit(): void {}
	onClickOk() {
		this.electronService.ipcRenderer.send('global-menu-popup:cancel')
	}
}

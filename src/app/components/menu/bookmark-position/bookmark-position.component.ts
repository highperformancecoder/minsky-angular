import { Component, OnInit } from '@angular/core'
import { ElectronService } from '../../../core/services'

@Component({
	selector: 'app-bookmark-position',
	templateUrl: './bookmark-position.component.html',
	styleUrls: ['./bookmark-position.component.scss'],
})
export class BookmarkPositionComponent implements OnInit {
	constructor(private eleService: ElectronService) {}

	ngOnInit(): void {}

	onClickedOk() {
		/*  const name = document.getElementById('bookmarkName').value
		if (name) {
			storage.has(bookmarkFileName, (err, isExist) => {
				if (err) throw err
				if (!isExist)
					storage.set(bookmarkFileName, [], (err) => {
						console.log('file error.....')
					})
			})
			setTimeout(() => {
				ipcRenderer.send('save-bookmark', {
					bookmarkTitle: name,
					fileName: bookmarkFileName,
				})
			}, 400)
		}

		ipcRenderer.on('bookmark-done-reply', (event, arg) => {
			ipcRenderer.send('global-menu-popup:cancel')
		}) */
	}

	close() {
		this.eleService.ipcRenderer.send('global-menu-popup:cancel')
	}
}

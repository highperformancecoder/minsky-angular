import { Component, OnInit } from '@angular/core'
import { ElectronService } from '../../../core/services'
import { FormGroup, FormBuilder } from '@angular/forms'

@Component({
	selector: 'app-bookmark-position',
	templateUrl: './bookmark-position.component.html',
	styleUrls: ['./bookmark-position.component.scss'],
})
export class BookmarkPositionComponent implements OnInit {
	formBookmark: FormGroup
	bookmark: any
	bookmarkFileName = 'bookmarks'
	electron = require('electron')
	storage = require('electron-json-storage')
	constructor(
		private eleService: ElectronService,
		private formBuilder: FormBuilder
	) {
		this.storage.setDataPath(
			(this.electron.app || this.electron.remote.app).getPath('userData')
		)
	}

	ngOnInit(): void {}

	onClickOk() {
		const name = this.bookmark
		if (name) {
			this.storage.has(this.bookmarkFileName, (err, isExist) => {
				if (err) throw err
				if (!isExist) {
					this.storage.set(this.bookmarkFileName, [], (error) => {
						console.log('file error.....')
					})
				}
			})
			setTimeout(() => {
				this.eleService.ipcRenderer.send('save-bookmark', {
					bookmarkTitle: name,
					fileName: this.bookmarkFileName,
				})
			}, 400)
		}

		this.eleService.ipcRenderer.on('bookmark-done-reply', (event, arg) => {
			this.close()
		})
	}

	close() {
		this.eleService.ipcRenderer.send('global-menu-popup:cancel')
	}
}

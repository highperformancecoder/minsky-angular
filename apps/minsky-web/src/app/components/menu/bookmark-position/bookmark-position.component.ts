import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ElectronService } from '@minsky/core';
import * as debug from 'debug';
// import * as electron from 'electron';
// import * as storage from 'electron-json-storage';

const logError = debug('minsky:web:error');

@Component({
  selector: 'app-bookmark-position',
  templateUrl: './bookmark-position.component.html',
  styleUrls: ['./bookmark-position.component.scss'],
})
class BookmarkPositionComponent {
  formBookmark: FormGroup;
  bookmark: any;
  bookmarkFileName = 'bookmarks';
  constructor(
    private eleService: ElectronService,
    private formBuilder: FormBuilder
  ) {
    if (this.eleService.isElectron) {
      /*  storage.setDataPath(
        (electron.app || eleService.remote.app).getPath('userData')
      ); */
    }
  }

  onClickOk() {
    if (this.eleService.isElectron) {
      const name = this.bookmark;
      if (name) {
        /*   storage.has(this.bookmarkFileName, (err, isExist) => {
          if (err) throw err;
          if (!isExist) {
            storage.set(this.bookmarkFileName, [], (error) => {
            });
          }
        }); */
        setTimeout(() => {
          this.eleService.ipcRenderer.send('save-bookmark', {
            bookmarkTitle: name,
            fileName: this.bookmarkFileName,
          });
        }, 400);
      }

      this.eleService.ipcRenderer.on('bookmark-done-reply', (event, arg) => {
        this.close();
      });
    }
  }

  close() {
    this.eleService.ipcRenderer.send('global-menu-popup:cancel');
  }
}

import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ElectronService } from '@minsky/core';
// import * as debug from 'debug';
// import * as electron from 'electron';
// import * as storage from 'electron-json-storage';

// const logInfo = debug('minsky:web:info');
// const logError = debug('minsky:web:error');

@Component({
  selector: 'minsky-bookmark-position',
  templateUrl: './bookmark-position.component.html',
  styleUrls: ['./bookmark-position.component.scss'],
})
export class BookmarkPositionComponent {
  formBookmark: FormGroup;
  bookmark: any;
  bookmarkFileName = 'bookmarks';
  constructor(private eleService: ElectronService) {
    if (this.eleService.isElectron) {
      /*    storage.setDataPath(
        (electron.app || eleService.remote.app).getPath('userData')
      ); */
    }
  }

  onClickOk() {
    const name = this.bookmark;
    if (name) {
      /*       storage.has(this.bookmarkFileName, (err, isExist) => {
        if (err) throw err;
        if (!isExist) {
          storage.set(this.bookmarkFileName, [], (error) => {
            logError('file error.....', error);
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

  close() {
    this.eleService.ipcRenderer.send('global-menu-popup:cancel');
  }
}

/* document.getElementById('bookmark-ok-btn').addEventListener('click', () => {
  const name = document.getElementById('bookmarkName').value;
  if (name) {
    storage.has(bookmarkFileName, (err, isExist) => {
      if (err) throw err;
      if (!isExist)
        storage.set(bookmarkFileName, [], (err) => {
          logError('file error.....',err);
        });
    });
    setTimeout(() => {
      ipcRenderer.send('save-bookmark', {
        bookmarkTitle: name,
        fileName: bookmarkFileName,
      });
    }, 400);
  }
});
 */

import { Component } from '@angular/core';
import { ElectronService } from '@minsky/core';

@Component({
  selector: 'minsky-bookmark-position',
  templateUrl: './bookmark-position.component.html',
  styleUrls: ['./bookmark-position.component.scss'],
})
export class BookmarkPositionComponent {
  // formBookmark: FormGroup;
  bookmark: any;
  bookmarkFileName = 'bookmarks';
  constructor(
    private eleService: ElectronService
  ) // private formBuilder: FormBuilder
  {
    // TODO
    // storage.setDataPath(
    //   (electron.app || eleService.remote.app).getPath('userData')
    // );
  }

  onClickOk() {
    const name = this.bookmark;
    if (name) {
      // storage.has(this.bookmarkFileName, (err, isExist) => {
      //   if (err) throw err;
      //   if (!isExist) {
      //     storage.set(this.bookmarkFileName, [], (error) => {
      //       console.log('file error.....');
      //     });
      //   }
      // });
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

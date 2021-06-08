import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ElectronService, StateManagementService } from '@minsky/core';
import { commandsMapping, events } from '@minsky/shared';

@Component({
  selector: 'minsky-add-bookmark',
  templateUrl: './add-bookmark.component.html',
  styleUrls: ['./add-bookmark.component.scss'],
})
export class AddBookmarkComponent {
  bookmarkName: FormControl;

  constructor(
    private electronService: ElectronService,
    private stateManagementService: StateManagementService
  ) {
    this.bookmarkName = new FormControl('', Validators.required);
  }

  async handleSubmit() {
    this.electronService.sendMinskyCommandAndRender({
      command: `${commandsMapping.ADD_BOOKMARK} "${this.bookmarkName.value}"`,
    });

    const bookmarkString = await this.stateManagementService.getCommandValue({
      command: commandsMapping.BOOKMARK_LIST,
    });

    this.electronService.ipcRenderer.send(
      events.ipc.POPULATE_BOOKMARKS,
      bookmarkString
    );

    this.closeWindow();
  }

  closeWindow() {
    if (this.electronService.isElectron) {
      this.electronService.remote.getCurrentWindow().close();
    }
  }
}

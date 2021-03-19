import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { CommunicationService, ElectronService } from '@minsky/core';
import { commandsMapping } from '@minsky/shared';

@Component({
  selector: 'minsky-add-bookmark',
  templateUrl: './add-bookmark.component.html',
  styleUrls: ['./add-bookmark.component.scss'],
})
export class AddBookmarkComponent {
  bookmarkName: FormControl;

  constructor(
    private communicationService: CommunicationService,
    private electronService: ElectronService
  ) {
    this.bookmarkName = new FormControl('', Validators.required);
  }

  handleSubmit() {
    this.communicationService.sendMinskyCommand({
      command: `${commandsMapping.ADD_BOOKMARK} "${this.bookmarkName.value}"`,
    });

    this.communicationService.sendMinskyCommand({
      command: commandsMapping.BOOKMARK_LIST,
    });

    this.closeWindow();
  }

  closeWindow() {
    if (this.electronService.isElectron) {
      this.electronService.remote.getCurrentWindow().close();
    }
  }
}

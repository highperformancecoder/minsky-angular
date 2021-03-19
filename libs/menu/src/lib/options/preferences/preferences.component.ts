import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { CommunicationService, ElectronService } from '@minsky/core';

@Component({
  selector: 'minsky-preferences',
  templateUrl: './preferences.component.html',
  styleUrls: ['./preferences.component.scss'],
})
export class PreferencesComponent {
  form: FormGroup;

  constructor(
    private electronService: ElectronService,
    private communicationService: CommunicationService
  ) {
    this.form = new FormGroup({
      godleyTableShowValues: new FormControl(null),
      godleyStyleRadioGroup: new FormControl(null),
      // drCrRadio: new FormControl(null),
      // plusMinusRadio: new FormControl(null),
      enableMultipleEquityColumns: new FormControl(null),
      numberOfRecentFilesToDisplay: new FormControl(null),
      wrapLongEquationsInLatexExport: new FormControl(null),
      enablePanopticon: new FormControl(null),
      focusFollowsMouse: new FormControl(null),
      font: new FormControl(null),
    });
  }

  handleSubmit() {
    // this.communicationService.sendMinskyCommand({
    //   command
    // })

    console.log(
      '🚀 ~ file: preferences.component.ts ~ line 38 ~ PreferencesComponent ~ handleSubmit ~ this.form.value',
      this.form.value
    );

    // this.closeWindow();
  }

  closeWindow() {
    if (this.electronService.isElectron) {
      this.electronService.remote.getCurrentWindow().close();
    }
  }
}

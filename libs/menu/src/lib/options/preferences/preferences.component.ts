import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ElectronService } from '@minsky/core';

@Component({
  selector: 'minsky-preferences',
  templateUrl: './preferences.component.html',
  styleUrls: ['./preferences.component.scss'],
})
export class PreferencesComponent {
  form: FormGroup;

  constructor(private electronService: ElectronService) {
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
    // this.communicationService.sendMinskyCommandAndRender({
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

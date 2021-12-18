import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ElectronService } from '@minsky/core';
import { commandsMapping, events } from '@minsky/shared';

@Component({
  selector: 'minsky-preferences',
  templateUrl: './preferences.component.html',
  styleUrls: ['./preferences.component.scss'],
})
export class PreferencesComponent implements OnInit {
  form: FormGroup;
  availableFonts: string[] = [];

  constructor(private electronService: ElectronService) {
    this.form = new FormGroup({
      godleyTableShowValues: new FormControl(null),
      godleyTableOutputStyle: new FormControl(null),
      enableMultipleEquityColumns: new FormControl(null),
      numberOfRecentFilesToDisplay: new FormControl(null),
      wrapLongEquationsInLatexExport: new FormControl(null),
      // focusFollowsMouse: new FormControl(null),
      font: new FormControl(null),
    });
  }
  async ngOnInit() {
    if (this.electronService.isElectron) {
      const preferences = await this.electronService.ipcRenderer.invoke(
        events.GET_PREFERENCES
      );
      this.form.patchValue(preferences);
      this.availableFonts = (await this.electronService.sendMinskyCommandAndRender(
        {
          command: commandsMapping.LIST_FONTS,
        }
      )) as string[];
    }
  }

  async handleSubmit() {
    const preferences = this.form.value;

    if (this.electronService.isElectron) {
      await this.electronService.ipcRenderer.invoke(
        events.UPDATE_PREFERENCES,
        preferences
      );
    }

    this.closeWindow();
  }

  closeWindow() {
    if (this.electronService.isElectron) {
      this.electronService.remote.getCurrentWindow().close();
    }
  }
}

import { Component } from '@angular/core';
import { AbstractControl, FormControl, Validators } from '@angular/forms';
import { ThemePalette } from '@angular/material/core';
import { ElectronService } from '@minsky/core';
import * as electron from 'electron';
import * as storage from 'electron-json-storage';
@Component({
  selector: 'app-background-color',
  templateUrl: './background-color.component.html',
  styleUrls: ['./background-color.component.scss'],
})
export class BackgroundColorComponent {
  public disabled = false;
  public color: ThemePalette = 'primary';
  public touchUi = false;
  defaultClr = '#c1c1c1';
  colorCtr: AbstractControl = new FormControl(null, [Validators.required]);

  public options = [
    { value: true, label: 'True' },
    { value: false, label: 'False' },
  ];

  public listColors = ['primary', 'accent', 'warn'];

  constructor(private eleService: ElectronService) {
    storage.setDataPath(
      (electron.app || electron.remote.app).getPath('userData')
    );
    storage.get('backgroundColor', (error, data: any) => {
      if (error) throw error;
      if (data.color !== undefined) {
        this.color = data.color;
      }
    });
  }

  onClickOk() {
    /*  const selectedClrCode = $('#color-picker').spectrum('get')
			const data = {
			color: selectedClrCode.toHexString(),
		} */
    // this.eleService.ipcRenderer.send('background-color:ok', data)
    this.eleService.ipcRenderer.on(
      'background-color:ok-reply',
      (event, arg) => {
        this.close();
      }
    );
  }

  close() {
    this.eleService.ipcRenderer.send('global-menu-popup:cancel');
  }
}

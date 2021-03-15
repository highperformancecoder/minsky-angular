import { Component } from '@angular/core';
import { AbstractControl, FormControl, Validators } from '@angular/forms';
import { ThemePalette } from '@angular/material/core';
import { ElectronService } from '@minsky/core';
@Component({
  selector: 'minsky-background-color',
  templateUrl: './background-color.component.html',
  styleUrls: ['./background-color.component.scss'],
})
export class BackgroundColorComponent {
  public disabled = false;
  public color: ThemePalette = 'primary';
  public touchUi = false;
  colorCtr: AbstractControl = new FormControl('#c1c1c1', [Validators.required]);

  public options = [
    { value: true, label: 'True' },
    { value: false, label: 'False' },
  ];

  public listColors = ['primary', 'accent', 'warn'];

  constructor(private eleService: ElectronService) {
    /*   storage.setDataPath(
      (electron.app || electron.remote.app).getPath('userData')
    );
    storage.get('backgroundColor', (error, data: any) => {
      if (error) throw error;
      if (data.color !== undefined) {
        this.color = data.color;
      }
    }); */
  }

  onClickOk() {
    const data = {
      color: this.colorCtr.value,
    };
    this.eleService.ipcRenderer.send('background-color:ok', data);
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

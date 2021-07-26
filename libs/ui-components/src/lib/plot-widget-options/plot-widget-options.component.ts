import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ElectronService } from '@minsky/core';

enum PlotType {
  AUTOMATIC = 'Automatic',
  BAR = 'Bar',
  LINE = 'Line',
}

@Component({
  selector: 'minsky-plot-widget-options',
  templateUrl: './plot-widget-options.component.html',
  styleUrls: ['./plot-widget-options.component.scss'],
})
export class PlotWidgetOptionsComponent implements OnInit {
  plotTypes: ['Automatic', 'Bar', 'Line'];
  form: FormGroup;

  constructor(private electronService: ElectronService) {
    this.form = new FormGroup({
      title: new FormControl(''),
      xLabel: new FormControl(''),
      yLabel: new FormControl(''),
      rhsYLabel: new FormControl(''),
      plotType: new FormControl(''),
      numberOfXTicks: new FormControl(null),
      numberOfYTicks: new FormControl(null),
      grid: new FormControl(false),
      subGrid: new FormControl(false),
      legend: new FormControl(false),
      xLogScale: new FormControl(false),
      yLogScale: new FormControl(false),
    });
  }

  ngOnInit() {}

  async handleSave() {
    if (this.electronService.isElectron) {
      //   await this.electronService.sendMinskyCommandAndRender({
      //     command: `${commandsMapping.CANVAS_ITEM_DESCRIPTION} "${this.name.value}"`,
      //   });
      //   await this.electronService.sendMinskyCommandAndRender({
      //     command: `${commandsMapping.CANVAS_ITEM_ROTATION} ${this.rotation.value}`,
      //   });
      //   await this.electronService.sendMinskyCommandAndRender({
      //     command: `${commandsMapping.CANVAS_ITEM_INT_VAR_INIT} "${this.initialValue.value}"`,
      //   });
      //   await this.electronService.sendMinskyCommandAndRender({
      //     command: `${commandsMapping.CANVAS_ITEM_INT_VAR_SET_UNITS} "${this.units.value}"`,
      //   });
      //   await this.electronService.sendMinskyCommandAndRender({
      //     command: `${commandsMapping.CANVAS_ITEM_INT_VAR_SLIDER_STEP_REL} ${this.relative.value}`,
      //   });
    }

    this.closeWindow();
  }

  closeWindow() {
    if (this.electronService.isElectron) {
      this.electronService.remote.getCurrentWindow().close();
    }
  }
}

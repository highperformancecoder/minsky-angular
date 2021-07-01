import { Component, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { ElectronService } from '@minsky/core';
import { commandsMapping } from '@minsky/shared';

interface Second {
  type: string;
  units: string;
}
interface Dimension {
  first: string;
  second: Second;
}
@Component({
  selector: 'minsky-dimensions',
  templateUrl: './dimensions.component.html',
  styleUrls: ['./dimensions.component.scss'],
})
export class DimensionsComponent implements OnInit {
  form: FormGroup;
  types = ['string', 'value', 'time'];

  timeFormatStrings = [
    { label: '1999-Q4', value: '%Y-Q%Q' },
    { label: '1999', value: '%Y' },
    { label: '12/31/99', value: '%m/%d/%y' },
    { label: '12/31/1999', value: '%m/%d/%Y' },
    { label: '31/12/99', value: '%d/%m/%y' },
    { label: '31/12/1999', value: '%d/%m/%Y' },
    { label: '1999-12-31T13:37:46', value: '%Y-%m-%dT%H:%M:%S' },
    { label: '12/31/1999 01:37 PM', value: '%m/%d/%Y %I:%M %p' },
    { label: '12/31/99 01:37 PM', value: '%m/%d/%y %I:%M %p' },
    { label: '12/31/1999 13:37 PM', value: '%m/%d/%Y %H:%M %p' },
    { label: '12/31/99 13:37 PM', value: '%m/%d/%y %H:%M %p' },
    { label: 'Friday, December 31, 1999', value: '%A, %B %d, %Y' },
    { label: 'Dec 31, 99', value: '%b %d, %y' },
    { label: 'Dec 31, 1999', value: '%b %d, %Y' },
    { label: '31. Dec. 1999', value: '%d. %b. %Y' },
    { label: 'December 31, 1999', value: '%B %d, %Y' },
    { label: '31. December 1999', value: '%d. %B %Y' },
    { label: 'Fri, Dec 31, 99', value: '%a, %b %d, %y' },
    { label: 'Fri 31/Dec 99', value: '%a %d/%b %y' },
    { label: 'Fri, Dec 31, 1999', value: '%a, %b %d, %Y' },
    { label: 'Friday, December 31, 1999', value: '%A, %B %d, %Y' },
    { label: '12-31', value: '%m-%d' },
    { label: '99-12-31', value: '%y-%m-%d' },
    { label: '1999-12-31', value: '%Y-%m-%d' },
    { label: '12/99', value: '%m/%y' },
    { label: 'Dec 31', value: '%b %d' },
    { label: 'December', value: '%B' },
    { label: '4th quarter 99', value: '%Qth quarter %y' },
  ];

  public get dimensions(): FormArray {
    return this.form.get('dimensions') as FormArray;
  }

  constructor(private electronService: ElectronService) {
    this.form = new FormGroup({ dimensions: new FormArray([]) });
  }

  ngOnInit() {
    (async () => {
      if (this.electronService.isElectron) {
        const dimensions = (await this.electronService.sendMinskyCommandAndRender(
          {
            command: commandsMapping.DIMENSIONS,
          }
        )) as Dimension[];
        // console.log(
        //   '🚀 ~ file: dimensions.component.ts ~ line 38 ~ DimensionsComponent ~ dimensions',
        //   dimensions
        // );

        dimensions.forEach((d) => {
          this.dimensions.push(this.createDimension(d));
        });
      }
    })();
  }

  createDimension(dimension: Dimension) {
    return new FormGroup({
      first: new FormControl(dimension.first),
      second: new FormGroup({
        type: new FormControl(dimension.second.type),
        units: new FormControl(dimension.second.units),
      }),
    });
  }

  closeWindow() {
    if (this.electronService.isElectron) {
      this.electronService.remote.getCurrentWindow().close();
    }
  }

  async handleSubmit() {
    // console.log(
    //   '🚀 ~ file: dimensions.component.ts ~ line 67 ~ DimensionsComponent ~ handleSubmit ~ this.form.value',
    //   this.form.value
    // );

    await this.electronService.sendMinskyCommandAndRender({
      command: `${commandsMapping.DIMENSIONS} ${JSON.stringify(
        this.form.value.dimensions
      )}`,
    });

    this.closeWindow();
  }
}

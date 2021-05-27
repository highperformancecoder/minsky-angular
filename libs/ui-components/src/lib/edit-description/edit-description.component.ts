import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ElectronService } from '@minsky/core';

@Component({
  selector: 'minsky-edit-description',
  templateUrl: './edit-description.component.html',
  styleUrls: ['./edit-description.component.scss'],
})
export class EditDescriptionComponent implements OnInit {
  tooltip = '';
  detailedText = '';
  type = '';

  editDescriptionForm: FormGroup;
  constructor(
    private route: ActivatedRoute,
    private electronService: ElectronService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.tooltip = params['tooltip'];
      this.detailedText = params['detailedText'];
      this.type = params['type'];
    });

    this.editDescriptionForm = new FormGroup({
      tooltip: new FormControl(this.tooltip),
      detailedText: new FormControl(this.detailedText),
    });
  }

  handleSave() {
    if (this.electronService.isElectron) {
      this.electronService.sendMinskyCommandAndRender({
        command: `/minsky/canvas/${this.type}/tooltip "${
          this.editDescriptionForm.get('tooltip').value
        }"`,
      });

      this.electronService.sendMinskyCommandAndRender({
        command: `/minsky/canvas/${this.type}/detailedText "${
          this.editDescriptionForm.get('detailedText').value
        }"`,
      });

      this.closeWindow();
    }
  }

  closeWindow() {
    if (this.electronService.isElectron) {
      this.electronService.remote.getCurrentWindow().close();
    }
  }
}

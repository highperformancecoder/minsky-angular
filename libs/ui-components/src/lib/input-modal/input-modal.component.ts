import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ElectronService } from '@minsky/core';

@Component({
  selector: 'minsky-input-modal',
  templateUrl: './input-modal.component.html',
  styleUrls: ['./input-modal.component.scss'],
})
export class InputModalComponent implements OnInit {
  @Input() input: string;
  @Output() saveInput = new EventEmitter<string>();

  nameControl: FormControl;
  constructor(private electronService: ElectronService) {}

  ngOnInit(): void {
    this.nameControl = new FormControl(this.input);
  }

  handleSave() {
    this.saveInput.emit(this.nameControl.value);
  }

  handleCancel() {
    if (this.electronService.isElectron) {
      this.electronService.remote.getCurrentWindow().close();
    }
  }
}

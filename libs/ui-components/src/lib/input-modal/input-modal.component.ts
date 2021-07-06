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
  @Input() positiveActionLabel = 'Save';
  @Output() saveInput = new EventEmitter<string>();

  nameControl: FormControl;
  constructor(private electronService: ElectronService) {}

  ngOnInit(): void {
    this.nameControl = new FormControl(this.input);
  }

  handleSave() {
    this.saveInput.emit(this.nameControl.value);

    this.closeWindow();
  }

  closeWindow() {
    if (this.electronService.isElectron) {
      this.electronService.remote.getCurrentWindow().close();
    }
  }
}

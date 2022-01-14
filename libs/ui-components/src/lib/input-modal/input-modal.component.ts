import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { WindowUtilityService } from '@minsky/core';

@Component({
  selector: 'minsky-input-modal',
  templateUrl: './input-modal.component.html',
  styleUrls: ['./input-modal.component.scss'],
})
export class InputModalComponent implements OnInit, AfterViewInit {
  @Input() input: string;
  @Input() positiveActionLabel = 'Save';
  @Output() saveInput = new EventEmitter<string>();
  @ViewChild('inputElement') inputElement: ElementRef;

  nameControl: FormControl;
  inputHtmlElement: HTMLElement;
  constructor(private windowUtilityService: WindowUtilityService) {}

  ngOnInit(): void {
    this.nameControl = new FormControl(this.input);
  }

  ngAfterViewInit(): void {
    this.inputHtmlElement = this.inputElement.nativeElement as HTMLElement;
    this.inputHtmlElement.focus();
  }

  handleSave() {
    this.saveInput.emit(this.nameControl.value);
  }

  closeWindow() {
    this.windowUtilityService.closeCurrentWindowIfNotMain();
  }
}

import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'minsky-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss'],
})
export class DialogComponent implements AfterViewInit {
  @ViewChild('inputElement') inputElement: ElementRef;
  inputHtmlElement: HTMLElement;

  constructor(
    public dialogRef: MatDialogRef<DialogComponent> // @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngAfterViewInit(): void {
    this.inputHtmlElement = this.inputElement.nativeElement as HTMLElement;
    // this.input = localStorage.getItem('multipleKeyString');
    this.inputHtmlElement.focus();
  }

  onCancel(): void {
    this.dialogRef.close();
  }
  handleSave(): void {
    this.dialogRef.close();
  }
}

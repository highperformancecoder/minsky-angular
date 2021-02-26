import {
  AfterViewInit,
  Component,
  EventEmitter,
  Output,
  ViewChild,
} from '@angular/core';
import { DisplayOption, NgTerminal } from 'ng-terminal';
@Component({
  selector: 'minsky-x-term',
  templateUrl: './x-term.component.html',
  styleUrls: ['./x-term.component.scss'],
})
export class XTermComponent implements AfterViewInit {
  @ViewChild('term', { static: true }) child: NgTerminal;
  @Output() onCommandEntered: EventEmitter<string>;

  displayOption: DisplayOption = {};
  displayOptionBounded: DisplayOption = {};

  currentLine = '';

  ngAfterViewInit() {
    this.child.write('Start typing the minsky commands here. \r\n$ ');
    this.child.keyEventInput.subscribe((e) => {
      // console.log('keyboard event:' + e.domEvent.keyCode + ', ' + e.key);

      const ev = e.domEvent;
      const printable = !ev.altKey && !ev.ctrlKey && !ev.metaKey;

      if (ev.keyCode === 13) {
        this.child.write('\r\n$ ');

        console.log(
          '🚀 ~ file: x-term.component.ts ~ line 33 ~ XTermComponent ~ this.child.keyEventInput.subscribe ~ currentLine',
          this.currentLine
        );

        if (this.currentLine) {
          this.onCommandEntered.emit(this.currentLine);
        }

        this.currentLine = '';
      } else if (ev.keyCode === 8) {
        // Do not delete the prompt
        if (this.child.underlying.buffer.active.cursorX > 2) {
          this.currentLine = this.currentLine.slice(0, -1);

          this.child.write('\b \b');
        }
      } else if (printable) {
        this.currentLine = this.currentLine + e.key;
        this.child.write(e.key);
      }
    });
  }
}

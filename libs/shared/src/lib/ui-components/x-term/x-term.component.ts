import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { ElectronService } from '@minsky/core';
import { DisplayOption, NgTerminal } from 'ng-terminal';
import { CairoPayload } from '../../interfaces/Interfaces';
@Component({
  selector: 'minsky-x-term',
  templateUrl: './x-term.component.html',
  styleUrls: ['./x-term.component.scss'],
})
export class XTermComponent implements OnInit, AfterViewInit {
  @ViewChild('term', { static: true }) child: NgTerminal;
  displayOption: DisplayOption = {};
  displayOptionBounded: DisplayOption = {};

  currentLine = '';

  constructor(private electronService: ElectronService) {}

  ngOnInit(): void {
    // if (this.electronService.isElectron) {
    this.electronService.ipcRenderer.on('cairo-reply', (event, stdout) => {
      console.log(
        '🚀 ~ file: x-term.component.ts ~ line 56 ~ XTermComponent ~ this.electronService.ipcRenderer.on ~ event',
        event
      );
      console.log(
        '🚀 ~ file: x-term.component.ts ~ line 56 ~ XTermComponent ~ this.electronService.ipcRenderer.on ~ stdout',
        stdout
      );
      // this.child.write(`${stdout} \r\n$`);
    });
    // }
  }
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
        if (this.currentLine && this.electronService.isElectron) {
          const payload: CairoPayload = {
            command: this.currentLine,
          };
          this.electronService.ipcRenderer.send('cairo', payload);
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

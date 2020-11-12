import { Component, OnInit } from '@angular/core';
import { ElectronService } from '@minsky/core';

@Component({
  selector: 'app-log-simulation',
  templateUrl: './log-simulation.component.html',
  styleUrls: ['./log-simulation.component.scss'],
})
export class LogSimulationComponent implements OnInit {
  constructor(private eleService: ElectronService) {}

  ngOnInit(): void {}

  onClickOk() {
    this.eleService.ipcRenderer.send('global-menu-popup:cancel');
  }
}

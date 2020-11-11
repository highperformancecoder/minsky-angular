import { Component, OnInit } from '@angular/core';
import { ElectronService } from '../../../../core/services';

@Component({
  selector: 'app-godley-table',
  templateUrl: './godley-table.component.html',
  styleUrls: ['./godley-table.component.scss'],
})
export class GodleyTableComponent implements OnInit {
  constructor(private electronService: ElectronService) {}

  ngOnInit(): void {}

  godleyTableOk() {
    console.log('button clicked');
    this.electronService.ipcRenderer.send('godley-table:ok', '');
  }
  onCancel() {
    this.electronService.ipcRenderer.send('global-menu-popup:cancel');
  }
}

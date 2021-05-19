import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ElectronService } from '@minsky/core';
import { commandsMapping } from '@minsky/shared';

@Component({
  selector: 'minsky-rename-all-instances',
  templateUrl: './rename-all-instances.component.html',
  styleUrls: ['./rename-all-instances.component.scss'],
})
export class RenameAllInstancesComponent implements OnInit {
  name: string;

  constructor(
    private route: ActivatedRoute,
    private electronService: ElectronService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.name = params['name'];
    });
  }

  handleSaveName(newName) {
    this.electronService.sendMinskyCommandAndRender({
      command: `${commandsMapping.CANVAS_RENAME_ALL_INSTANCES} "${newName}"`,
    });

    this.electronService.sendMinskyCommandAndRender({
      command: `${commandsMapping.CANVAS_REQUEST_REDRAW}"`,
    });
  }
}

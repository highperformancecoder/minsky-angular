import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ElectronService, WindowUtilityService } from '@minsky/core';
import { commandsMapping, replaceBackSlash } from '@minsky/shared';

@Component({
  selector: 'minsky-rename-all-instances',
  templateUrl: './rename-all-instances.component.html',
  styleUrls: ['./rename-all-instances.component.scss'],
})
export class RenameAllInstancesComponent implements OnInit {
  name: string;

  constructor(
    private route: ActivatedRoute,
    private electronService: ElectronService,
    private windowUtilityService: WindowUtilityService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.name = params['name'];
    });
  }

  async handleSaveInput(newName: string) {
    if (this.electronService.isElectron) {
      await this.electronService.sendMinskyCommandAndRender({
        command: `${
          commandsMapping.CANVAS_RENAME_ALL_INSTANCES
        } "${replaceBackSlash(newName)}"`,
      });

      await this.electronService.sendMinskyCommandAndRender({
        command: commandsMapping.REQUEST_REDRAW_SUBCOMMAND,
      });
      this.windowUtilityService.closeCurrentWindowIfNotMain();
    }
  }
}

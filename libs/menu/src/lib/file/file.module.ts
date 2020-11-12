import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AboutComponent } from './about/about.component';
import { FileRoutingModule } from './file-routing.module';
import { DimensionalAnalysisComponent } from './dimensional-analysis/dimensional-analysis.component';
import { LogSimulationComponent } from './log-simulation/log-simulation.component';
import { ObjectBrowserComponent } from './object-browser/object-browser.component';
import { SelectItemsComponent } from './select-items/select-items.component';

@NgModule({
  declarations: [AboutComponent, DimensionalAnalysisComponent, LogSimulationComponent, ObjectBrowserComponent, SelectItemsComponent],
  imports: [CommonModule, FileRoutingModule],
})
export class FileModule {}

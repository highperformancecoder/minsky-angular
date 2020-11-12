import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AboutComponent } from './about/about.component';
import { FileRoutingModule } from './file-routing.module';
import { DimensionalAnalysisComponent } from './dimensional-analysis/dimensional-analysis.component';

@NgModule({
  declarations: [AboutComponent, DimensionalAnalysisComponent],
  imports: [CommonModule, FileRoutingModule],
})
export class FileModule {}

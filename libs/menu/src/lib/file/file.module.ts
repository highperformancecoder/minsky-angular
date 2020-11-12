import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AboutComponent } from './about/about.component';
import { FileRoutingModule } from './file-routing.module';

@NgModule({
  declarations: [AboutComponent],
  imports: [CommonModule, FileRoutingModule],
})
export class FileModule {}

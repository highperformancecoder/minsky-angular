import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '@minsky/shared';
import { DialogComponent } from './component/dialog/dialog.component';
@NgModule({
  imports: [CommonModule, HttpClientModule, MaterialModule, FormsModule],
  declarations: [DialogComponent],
  exports: [DialogComponent],
})
export class CoreModule {}

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { MaterialModule } from '../../material.module';
import { SharedModule } from '../../shared/shared.module';
@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    // MaterialModule,
    ReactiveFormsModule,
    FormsModule,
    SharedModule,
  ],
})
export class MenuModule {}

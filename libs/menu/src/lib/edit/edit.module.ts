import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EditRoutingModule } from './edit-routing.module';
import { DimensionsComponent } from './dimensions/dimensions.component';


@NgModule({
  declarations: [DimensionsComponent],
  imports: [
    CommonModule,
    EditRoutingModule
  ]
})
export class EditModule { }

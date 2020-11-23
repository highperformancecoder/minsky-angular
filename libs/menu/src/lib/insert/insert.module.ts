import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InsertRoutingModule } from './insert-routing.module';
import { CreateVariableComponent } from './create-variable/create-variable.component';


@NgModule({
  declarations: [CreateVariableComponent],
  imports: [
    CommonModule,
    InsertRoutingModule
  ]
})
export class InsertModule { }

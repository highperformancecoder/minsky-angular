import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '@minsky/shared';
import { CreateVariableComponent } from './create-variable/create-variable.component';
import { GodleyTableComponent } from './godley-table/godley-table.component';
import { InsertRoutingModule } from './insert-routing.module';

@NgModule({
  declarations: [CreateVariableComponent, GodleyTableComponent],
  imports: [CommonModule, InsertRoutingModule, SharedModule],
})
export class InsertModule {}

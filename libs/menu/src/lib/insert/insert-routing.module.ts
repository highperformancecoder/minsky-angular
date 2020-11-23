import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateVariableComponent } from './create-variable/create-variable.component';
import { GodleyTableComponent } from './godley-table/godley-table.component';

const routes: Routes = [
  { path: 'create-variable', component: CreateVariableComponent },
  { path: 'godley-table', component: GodleyTableComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InsertRoutingModule {}

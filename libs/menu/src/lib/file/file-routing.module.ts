import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AboutComponent } from './about/about.component';
import { LogSimulationComponent } from './log-simulation/log-simulation.component';
import { SelectItemsComponent } from './select-items/select-items.component';

const routes: Routes = [
  { path: 'about', component: AboutComponent },
  { path: 'log-simulation', component: LogSimulationComponent },
  { path: 'select-items', component: SelectItemsComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FileRoutingModule {}

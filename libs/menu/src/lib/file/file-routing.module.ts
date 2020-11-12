import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AboutComponent } from './about/about.component';
import { DimensionalAnalysisComponent } from './dimensional-analysis/dimensional-analysis.component';
import { LogSimulationComponent } from './log-simulation/log-simulation.component';
import { ObjectBrowserComponent } from './object-browser/object-browser.component';
import { SelectItemsComponent } from './select-items/select-items.component';

const routes: Routes = [
  { path: 'about', component: AboutComponent },
  { path: 'dimensional-analysis', component: DimensionalAnalysisComponent },
  { path: 'log-simulation', component: LogSimulationComponent },
  { path: 'object-browser', component: ObjectBrowserComponent },
  { path: 'select-items', component: SelectItemsComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FileRoutingModule {}

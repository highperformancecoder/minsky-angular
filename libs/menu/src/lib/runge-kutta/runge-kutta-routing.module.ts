import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RungeKuttaParametersComponent } from './runge-kutta-parameters/runge-kutta-parameters.component';

const routes: Routes = [
  { path: 'runge-kutta-parameters', component: RungeKuttaParametersComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RungeKuttaRoutingModule {}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RungeKuttaRoutingModule } from './runge-kutta-routing.module';
import { RungeKuttaParametersComponent } from './runge-kutta-parameters/runge-kutta-parameters.component';


@NgModule({
  declarations: [RungeKuttaParametersComponent],
  imports: [
    CommonModule,
    RungeKuttaRoutingModule
  ]
})
export class RungeKuttaModule { }

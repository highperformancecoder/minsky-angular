import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../../material.module';
import { SharedModule } from '../../shared/shared.module';
import { RungeKuttaParametersComponent } from './runge-kutta-parameters/runge-kutta-parameters.component';

@NgModule({
  declarations: [RungeKuttaParametersComponent],
  imports: [
    CommonModule,
    MaterialModule,
    ReactiveFormsModule,
    FormsModule,
    SharedModule,
  ],
})
export class MenuModule {}

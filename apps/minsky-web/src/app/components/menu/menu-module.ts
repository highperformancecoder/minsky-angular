import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../../material.module';
import { SharedModule } from '../../shared/shared.module';
import { CreateVariableComponent } from './create-variable/create-variable.component';
import { GodleyTableComponent } from './insert/godley-table/godley-table.component';
import { PreferencesComponent } from './preferences/preferences.component';
import { RungeKuttaParametersComponent } from './runge-kutta-parameters/runge-kutta-parameters.component';

@NgModule({
  declarations: [
    CreateVariableComponent,
    PreferencesComponent,
    RungeKuttaParametersComponent,
    GodleyTableComponent,
  ],
  imports: [
    CommonModule,
    MaterialModule,
    ReactiveFormsModule,
    FormsModule,
    SharedModule,
  ],
})
export class MenuModule {}

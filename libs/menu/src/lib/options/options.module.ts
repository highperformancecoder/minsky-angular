import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OptionsRoutingModule } from './options-routing.module';
import { PreferencesComponent } from './preferences/preferences.component';
import { BackgroundColorComponent } from './background-color/background-color.component';


@NgModule({
  declarations: [PreferencesComponent, BackgroundColorComponent],
  imports: [
    CommonModule,
    OptionsRoutingModule
  ]
})
export class OptionsModule { }

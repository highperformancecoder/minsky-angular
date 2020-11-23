import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OptionsRoutingModule } from './options-routing.module';
import { PreferencesComponent } from './preferences/preferences.component';


@NgModule({
  declarations: [PreferencesComponent],
  imports: [
    CommonModule,
    OptionsRoutingModule
  ]
})
export class OptionsModule { }

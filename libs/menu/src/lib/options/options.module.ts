import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BackgroundColorComponent } from './background-color/background-color.component';
import { OptionsRoutingModule } from './options-routing.module';
import { PreferencesComponent } from './preferences/preferences.component';

@NgModule({
  declarations: [PreferencesComponent, BackgroundColorComponent],
  imports: [CommonModule, OptionsRoutingModule, ReactiveFormsModule],
})
export class OptionsModule {}

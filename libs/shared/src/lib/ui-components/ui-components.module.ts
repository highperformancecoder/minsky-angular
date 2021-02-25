import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgTerminalModule } from 'ng-terminal';
import { MaterialModule } from '../material/material.module';
import { CliInputComponent } from './cli-input/cli-input.component';
import { EquationsComponent } from './equations/equations.component';
import { HeaderComponent } from './header/header.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { ParametersComponent } from './parameters/parameters.component';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { VariablesComponent } from './variables/variables.component';
import { WiringComponent } from './wiring/wiring.component';
import { XTermComponent } from './x-term/x-term.component';
@NgModule({
  declarations: [
    ToolbarComponent,
    PageNotFoundComponent,
    HeaderComponent,
    WiringComponent,
    EquationsComponent,
    ParametersComponent,
    VariablesComponent,
    XTermComponent,
    CliInputComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NgTerminalModule,
    NgSelectModule,
    MaterialModule,
  ],
  exports: [
    ToolbarComponent,
    PageNotFoundComponent,
    HeaderComponent,
    WiringComponent,
    EquationsComponent,
    ParametersComponent,
    VariablesComponent,
    XTermComponent,
    CliInputComponent,
  ],
})
export class UiComponentsModule {}

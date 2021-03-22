import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '@minsky/shared';
import { NgTerminalModule } from 'ng-terminal';
import { CliInputComponent } from './cli-input/cli-input.component';
import { EquationsComponent } from './equations/equations.component';
import { HeaderComponent } from './header/header.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { ParametersComponent } from './parameters/parameters.component';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { VariablesComponent } from './variables/variables.component';
import { WiringComponent } from './wiring/wiring.component';
import { XTermComponent } from './x-term/x-term.component';
import { EulerComponent } from './wiring/euler/euler.component';
import { BinaryOperationsComponent } from './wiring/binary-operations/binary-operations.component';
import { FunctionsComponent } from './wiring/functions/functions.component';
import { ReductionsComponent } from './wiring/reductions/reductions.component';
import { ScansComponent } from './wiring/scans/scans.component';
import { TensorOperationsComponent } from './wiring/tensor-operations/tensor-operations.component';
import { VariableComponent } from './wiring/variable/variable.component';
@NgModule({
  declarations: [
    HeaderComponent,
    ToolbarComponent,
    PageNotFoundComponent,
    WiringComponent,
    EquationsComponent,
    ParametersComponent,
    VariablesComponent,
    XTermComponent,
    CliInputComponent,
    EulerComponent,
    BinaryOperationsComponent,
    FunctionsComponent,
    ReductionsComponent,
    ScansComponent,
    TensorOperationsComponent,
    VariableComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NgTerminalModule,
    MaterialModule,
  ],
  exports: [
    PageNotFoundComponent,
    HeaderComponent,
    ToolbarComponent,
    WiringComponent,
    EquationsComponent,
    ParametersComponent,
    VariablesComponent,
    XTermComponent,
    CliInputComponent,
  ],
})
export class UiComponentsModule {}

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '@minsky/shared';
import { CliInputComponent } from './cli-input/cli-input.component';
import { EquationsComponent } from './equations/equations.component';
import { HeaderComponent } from './header/header.component';
import { InputModalComponent } from './input-modal/input-modal.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { ParametersComponent } from './parameters/parameters.component';
import { RenameAllInstancesComponent } from './rename-all-instances/rename-all-instances.component';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { VariablesComponent } from './variables/variables.component';
import { BinaryOperationsComponent } from './wiring/binary-operations/binary-operations.component';
import { EulerComponent } from './wiring/euler/euler.component';
import { FunctionsComponent } from './wiring/functions/functions.component';
import { ReductionsComponent } from './wiring/reductions/reductions.component';
import { ScansComponent } from './wiring/scans/scans.component';
import { TensorOperationsComponent } from './wiring/tensor-operations/tensor-operations.component';
import { VariableComponent } from './wiring/variable/variable.component';
import { WiringComponent } from './wiring/wiring.component';
import { EditDescriptionComponent } from './edit-description/edit-description.component';
@NgModule({
  declarations: [
    HeaderComponent,
    ToolbarComponent,
    PageNotFoundComponent,
    WiringComponent,
    EquationsComponent,
    ParametersComponent,
    VariablesComponent,
    CliInputComponent,
    EulerComponent,
    BinaryOperationsComponent,
    FunctionsComponent,
    ReductionsComponent,
    ScansComponent,
    TensorOperationsComponent,
    VariableComponent,
    RenameAllInstancesComponent,
    InputModalComponent,
    EditDescriptionComponent,
  ],
  imports: [CommonModule, SharedModule],
  exports: [
    PageNotFoundComponent,
    HeaderComponent,
    ToolbarComponent,
    WiringComponent,
    EquationsComponent,
    ParametersComponent,
    VariablesComponent,
    CliInputComponent,
    RenameAllInstancesComponent,
    InputModalComponent,
    EditDescriptionComponent,
  ],
})
export class UiComponentsModule {}

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CairoRoutingModule } from './cairo-routing.module';
import { CairoComponent } from './cairo.component';

@NgModule({
  declarations: [CairoComponent],
  imports: [CommonModule, CairoRoutingModule, ReactiveFormsModule],
})
export class CairoModule {}

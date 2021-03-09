import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Route, RouterModule } from '@angular/router';
import { MaterialModule } from './material/material.module';

export const sharedRoutes: Route[] = [];

@NgModule({
  imports: [CommonModule, RouterModule, MaterialModule, FormsModule],
  declarations: [],
  exports: [MaterialModule, FormsModule],
})
export class SharedModule {}

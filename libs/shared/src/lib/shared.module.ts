import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { MaterialModule } from './material/material.module';
import { ToolbarComponent } from './toolbar/toolbar.component';

export const sharedRoutes: Route[] = [];

@NgModule({
  imports: [CommonModule, RouterModule, MaterialModule],
  declarations: [ToolbarComponent],
  exports: [ToolbarComponent, MaterialModule],
})
export class SharedModule {}

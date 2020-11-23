import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { ToolbarComponent } from './toolbar/toolbar.component';

export const sharedRoutes: Route[] = [];

@NgModule({
  imports: [CommonModule, RouterModule],
  declarations: [ToolbarComponent],
  exports: [ToolbarComponent],
})
export class SharedModule {}

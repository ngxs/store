import { NgModule } from '@angular/core';
import { ListComponent } from './list.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgxsModule } from 'ngxs';
import { ListStore } from './list.store';
import { routes } from './list.routes';

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), NgxsModule.forFeature([ListStore])],
  declarations: [ListComponent],
})
export class ListModule {}

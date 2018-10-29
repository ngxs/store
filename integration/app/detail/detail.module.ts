import { NgModule } from '@angular/core';
import { DetailComponent } from './detail.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgxsModule } from '@ngxs/store';
import { routes } from './detail.routes';

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), NgxsModule.forFeature()],
  declarations: [DetailComponent]
})
export class DetailModule {}

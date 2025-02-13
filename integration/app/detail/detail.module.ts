import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgxsModule } from '@ngxs/store';

import { DetailState } from '@integration/detail/detail.state';
import { routes } from '@integration/detail/detail.routes';

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), NgxsModule.forFeature([DetailState])]
})
export class DetailModule {}

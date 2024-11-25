import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgxsModule } from '@ngxs/store';

import { ListState } from '@integration/list/list.state';
import { routes } from '@integration/list/list.routes';
import { ListResolver } from '@integration/list/list.resolver';

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), NgxsModule.forFeature([ListState])],
  providers: [ListResolver]
})
export class ListModule {}

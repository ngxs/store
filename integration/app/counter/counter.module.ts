import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { routes } from '@integration/counter/counter.routes';
import { CounterComponent } from '@integration/counter/counter.component';
import { NgxsModule } from '@ngxs/store';
import { CounterState } from '@integration/counter/counter.state';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    NgxsModule.forFeature([CounterState])
  ],
  declarations: [CounterComponent]
})
export class CounterModule {}

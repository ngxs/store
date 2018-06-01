import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxsModule } from '@ngxs/store';
import { ChangeValuesState } from './change-value.state';
import { ChangeValueComponent } from './change-value.component';

@NgModule({
  imports: [CommonModule, NgxsModule.forFeature([ChangeValuesState])],
  declarations: [ChangeValueComponent],
  exports: [ChangeValueComponent]
})
export class ChangeValueModule {}

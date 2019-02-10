import { Injectable } from '@angular/core';
import { NgxsNextPluginFn, NgxsPlugin } from '@ngxs/store';

@Injectable()
export class NgxsResetPlugin implements NgxsPlugin {
  handle(state: any, action: any, next: NgxsNextPluginFn) {
    return next(state, action);
  }
}

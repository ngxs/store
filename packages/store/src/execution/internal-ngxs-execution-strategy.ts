import { Injectable, inject } from '@angular/core';

import { NgxsExecutionStrategy, NGXS_EXECUTION_STRATEGY } from './symbols';

@Injectable({ providedIn: 'root' })
export class InternalNgxsExecutionStrategy implements NgxsExecutionStrategy {
  private _executionStrategy = inject(NGXS_EXECUTION_STRATEGY);

  enter<T>(func: () => T): T {
    return this._executionStrategy.enter(func);
  }

  leave<T>(func: () => T): T {
    return this._executionStrategy.leave(func);
  }
}

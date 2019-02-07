import { Injectable, Inject } from '@angular/core';

import { NgxsExecutionStrategy, NGXS_EXECUTION_STRATEGY } from './symbols';

@Injectable()
export class InternalNgxsExecutionStrategy implements NgxsExecutionStrategy {
  constructor(
    @Inject(NGXS_EXECUTION_STRATEGY) private _executionStrategy: NgxsExecutionStrategy
  ) {}

  enter<T>(func: () => T): T {
    return this._executionStrategy.enter(func);
  }

  leave<T>(func: () => T): T {
    return this._executionStrategy.leave(func);
  }
}

import { Injectable } from '@angular/core';

import { NgxsExecutionStrategy } from '../symbols';

@Injectable()
export class NoopNgxsExecutionStrategy implements NgxsExecutionStrategy {
  enter<T>(func: (...args: any[]) => T): T {
    return func();
  }

  leave<T>(func: (...args: any[]) => T): T {
    return func();
  }
}

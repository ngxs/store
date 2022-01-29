import { Injectable } from '@angular/core';

import { NgxsExecutionStrategy } from './symbols';

@Injectable({ providedIn: 'root' })
export class NoopNgxsExecutionStrategy implements NgxsExecutionStrategy {
  enter<T>(func: () => T): T {
    return func();
  }

  leave<T>(func: () => T): T {
    return func();
  }
}

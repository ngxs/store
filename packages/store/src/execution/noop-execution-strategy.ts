import { Injectable, makeEnvironmentProviders } from '@angular/core';
import { InternalNgxsExecutionStrategy } from './execution-strategy';
import type { NgxsExecutionStrategy } from './symbols';

@Injectable({ providedIn: 'root' })
export class NoopNgxsExecutionStrategy implements NgxsExecutionStrategy {
  enter<T>(func: () => T): T {
    return func();
  }

  leave<T>(func: () => T): T {
    return func();
  }
}

export function withNgxsNoopExecutionStrategy() {
  return makeEnvironmentProviders([
    {
      provide: InternalNgxsExecutionStrategy,
      useExisting: NoopNgxsExecutionStrategy
    }
  ]);
}

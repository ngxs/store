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

/**
 * Determines the execution context to perform async operations inside. An implementation can be
 * provided to override the default behaviour where the async operations are run
 * outside Angular's zone but all observable behaviours of NGXS are run back inside Angular's zone.
 * These observable behaviours are from:
 *   `store.selectSignal(...)`, `store.select(...)`, `actions.subscribe(...)` or `store.dispatch(...).subscribe(...)`
 * Every `zone.run` causes Angular to run change detection on the whole tree (`app.tick()`) so of your
 * application doesn't rely on zone.js running change detection then you can switch to the
 * `NoopNgxsExecutionStrategy` that doesn't interact with zones.
 */
export function withNgxsNoopExecutionStrategy() {
  return makeEnvironmentProviders([
    {
      provide: InternalNgxsExecutionStrategy,
      useExisting: NoopNgxsExecutionStrategy
    }
  ]);
}

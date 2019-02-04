import { Injectable, Injector, StaticProvider, NgZone, PLATFORM_ID } from '@angular/core';

import { NgxsExecutionStrategy, NgxsConfig } from '../symbols';

@Injectable()
export class InternalNgxsExecutionStrategy implements NgxsExecutionStrategy {
  private _strategy: NgxsExecutionStrategy;

  constructor(private _config: NgxsConfig, injector: Injector) {
    const executionStrategy = this._config.executionStrategy;
    const provider: StaticProvider = {
      provide: executionStrategy,
      useClass: executionStrategy,
      deps: [Injector]
    };
    const innerInjector = Injector.create([provider], injector);
    this._strategy = innerInjector.get<NgxsExecutionStrategy>(provider.provide);
  }

  enter<T>(func: (...args: any[]) => T): T {
    return this._strategy.enter(func);
  }

  leave<T>(func: (...args: any[]) => T): T {
    return this._strategy.leave(func);
  }
}

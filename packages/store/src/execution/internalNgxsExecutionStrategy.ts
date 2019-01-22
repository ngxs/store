import { Injectable, Injector, StaticProvider, NgZone, PLATFORM_ID } from '@angular/core';

import { NgxsExecutionStrategy, NgxsConfig } from '../symbols';
import { DispatchOutsideZoneNgxsExecutionStrategy } from './dispatchOutsideZoneNgxsExecutionStrategy';
import { NoopNgxsExecutionStrategy } from './noopNgxsExecutionStrategy';

@Injectable()
export class InternalNgxsExecutionStrategy implements NgxsExecutionStrategy {
  private _strategy: NgxsExecutionStrategy;

  constructor(private _config: NgxsConfig, injector: Injector) {
    const shouldBeRunInsideZone = this._config.outsideZone === false;
    const provider: StaticProvider = shouldBeRunInsideZone
      ? {
          provide: NoopNgxsExecutionStrategy,
          useClass: NoopNgxsExecutionStrategy,
          deps: []
        }
      : {
          provide: DispatchOutsideZoneNgxsExecutionStrategy,
          useClass: DispatchOutsideZoneNgxsExecutionStrategy,
          deps: [NgZone, PLATFORM_ID]
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

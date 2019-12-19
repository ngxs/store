import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { ActionType, getValue, NgxsNextPluginFn, NgxsPlugin, setValue } from '@ngxs/store';
import { tap } from 'rxjs/operators';

import {
  NGXS_STORAGE_PLUGIN_OPTIONS,
  NgxsStoragePluginOptions,
  STORAGE_ENGINE,
  StorageEngine
} from './symbols';
import {
  checkIsInitAction,
  DATA_ERROR_CODE,
  DEFAULT_STATE_KEY,
  isNotNull,
  States
} from './internals';

@Injectable()
export class NgxsStoragePlugin implements NgxsPlugin {
  private hasMigration = false;

  constructor(
    @Inject(NGXS_STORAGE_PLUGIN_OPTIONS) private _options: NgxsStoragePluginOptions,
    @Inject(STORAGE_ENGINE) private _engine: StorageEngine,
    @Inject(PLATFORM_ID) private _platformId: string
  ) {}

  public handle(states: States, action: ActionType, next: NgxsNextPluginFn): NgxsNextPluginFn {
    if (isPlatformServer(this._platformId) && this._engine === null) {
      return next(states, action);
    }

    states = checkIsInitAction(action) ? this.pullStatesFromStorage(states) : states;
    return next(states, action).pipe(
      tap((nextStates: States) => this.nextCycleSynchronization(nextStates, action))
    );
  }

  private nextCycleSynchronization(nextStates: States, action: ActionType): void {
    const isInitAction: boolean = checkIsInitAction(action);
    if (!isInitAction || (isInitAction && this.hasMigration)) {
      this.pushStatesIntoStorage(nextStates);
    }
  }

  /**
   * Note: we cast to `string[]` here as we're sure that this option has been
   * transformed by the `storageOptionsFactory` function that provided token
   */
  private keys(): string[] {
    return this._options.key as string[];
  }

  /**
   * Note: we read the values from the storage and fill the states
   */
  private pullStatesFromStorage(states: States): States {
    for (const key of this.keys()) {
      const isMaster: boolean = key === DEFAULT_STATE_KEY;
      let value: any = this._engine.getItem(key!);

      if (isNotNull(value)) {
        try {
          value = this._options.deserialize!(value);
        } catch (e) {
          console.error(DATA_ERROR_CODE.DESERIALIZE);
          value = {};
        }

        if (this._options.migrations) {
          this._options.migrations.forEach(strategy => {
            const versionIsMatched: boolean =
              strategy.version === getValue(value, strategy.versionKey || 'version');
            const keyIsMatched: boolean = (!strategy.key && isMaster) || strategy.key === key;
            if (versionIsMatched && keyIsMatched) {
              value = strategy.migrate(value);
              this.hasMigration = true;
            }
          });
        }

        states = !isMaster ? setValue(states, key!, value) : { ...states, ...value };
      }
    }

    return states;
  }

  /**
   * Note: We update states after the first synchronization
   */
  private pushStatesIntoStorage(states: States): void {
    for (const key of this.keys()) {
      let value: States = states;

      if (key !== DEFAULT_STATE_KEY) {
        value = getValue(states, key!);
      }

      try {
        this._engine.setItem(key!, this._options.serialize!(value));
      } catch (e) {
        console.error(DATA_ERROR_CODE.SERIALIZE);
      }
    }
  }
}

import { Injectable, OnDestroy } from '@angular/core';
import { NgxsBootstrapper } from '@ngxs/store/internals';
import { Subject } from 'rxjs';
import { filter, mergeMap, pairwise, startWith, takeUntil, tap } from 'rxjs/operators';

import { Store } from '../store';
import { getValue } from '../utils/utils';
import { StateContextFactory } from './state-context-factory';
import { InternalStateOperations } from './state-operations';
import { MappedStore, StatesAndDefaults } from './internals';
import { NgxsLifeCycle, NgxsSimpleChange, StateContext } from '../symbols';

@Injectable()
export class LifecycleStateManager implements OnDestroy {
  private readonly _destroy$ = new Subject<void>();

  constructor(
    private _store: Store,
    private _internalStateOperations: InternalStateOperations,
    private _stateContextFactory: StateContextFactory,
    private _bootstrapper: NgxsBootstrapper
  ) {}

  ngOnDestroy(): void {
    this._destroy$.next();
  }

  ngxsBootstrap<T>(action: T, results: StatesAndDefaults | undefined): void {
    this._internalStateOperations
      .getRootStateOperations()
      .dispatch(action)
      .pipe(
        filter(() => !!results),
        tap(() => this._invokeInit(results!.states)),
        mergeMap(() => this._bootstrapper.appBootstrapped$),
        filter(appBootstrapped => !!appBootstrapped),
        takeUntil(this._destroy$)
      )
      .subscribe(() => this._invokeBootstrap(results!.states));
  }

  /**
   * Invoke the init function on the states.
   */
  private _invokeInit(mappedStores: MappedStore[]): void {
    for (const mappedStore of mappedStores) {
      const instance: NgxsLifeCycle = mappedStore.instance;

      if (instance.ngxsOnChanges) {
        this._store
          .select(state => getValue(state, mappedStore.path))
          .pipe(startWith(undefined), pairwise(), takeUntil(this._destroy$))
          .subscribe(([previousValue, currentValue]) => {
            const change = new NgxsSimpleChange(
              previousValue,
              currentValue,
              !mappedStore.isInitialised
            );
            instance.ngxsOnChanges!(change);
          });
      }

      if (instance.ngxsOnInit) {
        instance.ngxsOnInit(this._getStateContext(mappedStore));
      }

      mappedStore.isInitialised = true;
    }
  }

  /**
   * Invoke the bootstrap function on the states.
   */
  private _invokeBootstrap(mappedStores: MappedStore[]) {
    for (const mappedStore of mappedStores) {
      const instance: NgxsLifeCycle = mappedStore.instance;
      if (instance.ngxsAfterBootstrap) {
        instance.ngxsAfterBootstrap(this._getStateContext(mappedStore));
      }
    }
  }

  private _getStateContext(mappedStore: MappedStore): StateContext<any> {
    return this._stateContextFactory.createStateContext(mappedStore);
  }
}

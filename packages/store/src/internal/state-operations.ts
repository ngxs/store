import { Injectable, isDevMode } from '@angular/core';

import { filter, tap, mergeMap } from 'rxjs/operators';

import { Bootstrapper } from './bootstrapper';
import { StateFactory } from './state-factory';
import { StateOperations, StatesAndDefaults } from '../internal/internals';
import { InternalDispatcher } from '../internal/dispatcher';
import { StateStream } from './state-stream';
import { NgxsConfig } from '../symbols';
import { deepFreeze } from '../utils/freeze';
import { isAngularInTestMode } from '../utils/angular';

/**
 * State Context factory class
 * @ignore
 */
@Injectable()
export class InternalStateOperations {
  constructor(
    private _stateStream: StateStream,
    private _dispatcher: InternalDispatcher,
    private _config: NgxsConfig
  ) {
    this.verifyDevMode();
  }

  /**
   * Returns the root state operators.
   */
  getRootStateOperations(): StateOperations<any> {
    const rootStateOperations = {
      getState: () => this._stateStream.getValue(),
      setState: (newState: any) => this._stateStream.next(newState),
      dispatch: (actions: any[]) => this._dispatcher.dispatch(actions)
    };

    if (this._config.developmentMode) {
      return this.ensureStateAndActionsAreImmutable(rootStateOperations);
    }

    return rootStateOperations;
  }

  private verifyDevMode() {
    if (isAngularInTestMode()) return;

    const isNgxsDevMode = this._config.developmentMode;
    const isNgDevMode = isDevMode();
    const incorrectProduction = !isNgDevMode && isNgxsDevMode;
    const incorrectDevelopment = isNgDevMode && !isNgxsDevMode;
    const example = 'NgxsModule.forRoot(states, { developmentMode: !environment.production })';

    if (incorrectProduction) {
      console.warn(
        'Angular is running in production mode but NGXS is still running in the development mode!\n',
        'Please set developmentMode to false on the NgxsModule options when in production mode.\n',
        example
      );
    } else if (incorrectDevelopment) {
      console.warn(
        'RECOMMENDATION: Set developmentMode to true on the NgxsModule when Angular is running in development mode.\n',
        example
      );
    }
  }

  private ensureStateAndActionsAreImmutable(root: StateOperations<any>): StateOperations<any> {
    return {
      getState: () => root.getState(),
      setState: value => {
        const frozenValue = deepFreeze(value);
        return root.setState(frozenValue);
      },
      dispatch: actions => {
        return root.dispatch(actions);
      }
    };
  }

  dispatchActionAndInvokeLifecyleHooks<T>(
    action: T,
    results: StatesAndDefaults,
    factory: StateFactory,
    bootsrapper: Bootstrapper
  ): void {
    this.getRootStateOperations()
      .dispatch(action)
      .pipe(
        filter(() => !!results),
        tap(() => factory.invokeInit(results!.states)),
        mergeMap(() => bootsrapper.appBootstrapped$),
        filter(appBootrapped => !!appBootrapped)
      )
      .subscribe(() => {
        factory.invokeBootstrap(results!.states);
      });
  }
}

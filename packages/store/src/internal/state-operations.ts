import { Injectable, isDevMode, Type } from '@angular/core';

import {
  DefaultStateRef,
  NgxsInitializeOptions,
  StateOperations
} from '../internal/internals';
import { InternalDispatcher } from '../internal/dispatcher';
import { StateStream } from './state-stream';
import { NgxsConfig } from '../symbols';
import { deepFreeze } from '../utils/freeze';
import { isAngularInTestMode } from '../utils/angular';
import { MappedStore } from '@ngxs/store/src/internal/internals';

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
  public getRootStateOperations(): StateOperations<any> {
    const rootStateOperations = {
      getState: () => this._stateStream.getValue(),
      setState: (newState: any) => this._stateStream.next(newState),
      dispatch: (actions: Type<unknown>[]) => this._dispatcher.dispatch(actions)
    };

    if (this._config.developmentMode) {
      return this.ensureStateAndActionsAreImmutable(rootStateOperations);
    }

    return rootStateOperations;
  }

  public ngxsBootstrap(options: NgxsInitializeOptions) {
    const { factory, states, action, ngxsAfterBootstrap } = options;
    const results: DefaultStateRef = factory.addAndReturnDefaults(states || []);
    const stateRootOperations = this.getRootStateOperations();

    const currentStateByRootTree = stateRootOperations.getState();
    const newStateBySubTree = results.defaults;

    const nameRootStates: string[] = Object.keys(currentStateByRootTree);
    const nameStates: string[] = Object.keys(newStateBySubTree);

    const unmountedKeys: string[] = nameStates.filter(name => !nameRootStates.includes(name));
    const uniqueResult: DefaultStateRef = this.findUnmountedState(results, unmountedKeys);

    stateRootOperations.setState({ ...currentStateByRootTree, ...uniqueResult.defaults });

    if (ngxsAfterBootstrap) {
      ngxsAfterBootstrap();
    }

    if (uniqueResult.states.length) {
      stateRootOperations.dispatch(new action()).subscribe(() => {
        factory.invokeInit(uniqueResult.states);
      });
    }
  }

  private findUnmountedState(result: DefaultStateRef, uniqueKeys: string[]): DefaultStateRef {
    const newResult: DefaultStateRef = { defaults: {}, states: [] };
    const defaults = result.defaults;
    const states: MappedStore[] = result.states;

    for (const options in defaults) {
      if (defaults.hasOwnProperty(options) && uniqueKeys.includes(options)) {
        newResult.defaults[options] = defaults[options];
      }
    }

    newResult.states = states.filter((meta: MappedStore) => uniqueKeys.includes(meta.name));

    return newResult;
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
}

import { Injectable } from '@angular/core';

import { ConfigValidator } from './config-validator';
import { StateOperations, StatesAndDefaults } from '../internal/internals';
import { InternalDispatcher } from '../internal/dispatcher';
import { StateStream } from './state-stream';
import { NgxsConfig } from '../symbols';
import { deepFreeze } from '../utils/freeze';
import { ActionType } from '../actions/symbols';

/**
 * State Context factory class
 * @ignore
 */
@Injectable()
export class InternalStateOperations {
  constructor(
    private _stateStream: StateStream,
    private _dispatcher: InternalDispatcher,
    private _config: NgxsConfig,
    configValidator: ConfigValidator
  ) {
    configValidator.verifyDevMode();
  }

  /**
   * Returns the root state operators.
   */
  getRootStateOperations<T = any, K = any>(): StateOperations<T, K> {
    const rootStateOperations: StateOperations<T, K> = {
      getState: () => this._stateStream.getValue(),
      setState: (val: T) => this._stateStream.next(val),
      dispatch: (actions: ActionType | ActionType[]) => this._dispatcher.dispatch<K>(actions)
    };

    if (this._config.developmentMode) {
      return this.ensureStateAndActionsAreImmutable<T, K>(rootStateOperations);
    }

    return rootStateOperations;
  }

  private ensureStateAndActionsAreImmutable<T = any, K = any>(
    root: StateOperations<T, K>
  ): StateOperations<T, K> {
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

  setStateToTheCurrentWithNew<T = any, K = any>(results: StatesAndDefaults<T, K>): void {
    const stateOperations: StateOperations<T, K> = this.getRootStateOperations();

    // Get our current stream
    const currentState = stateOperations.getState();
    // Set the state to the current + new
    stateOperations.setState({ ...(currentState as any), ...(results.defaults as any) });
  }
}

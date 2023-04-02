import { Injectable } from '@angular/core';

import { StateOperations, StatesAndDefaults } from '../internal/internals';
import { InternalDispatcher } from '../internal/dispatcher';
import { StateStream } from './state-stream';
import { NgxsConfig, DispatchOptions } from '../symbols';
import { deepFreeze } from '../utils/freeze';

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
  ) {}

  /**
   * Returns the root state operators.
   */
  getRootStateOperations(): StateOperations<any> {
    const rootStateOperations = {
      getState: () => this._stateStream.getValue(),
      setState: (newState: any) => this._stateStream.next(newState),
      dispatch: (actionOrActions: any | any[], dispatchOptions?: DispatchOptions) =>
        this._dispatcher.dispatch(actionOrActions, dispatchOptions)
    };

    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      return this._config.developmentMode
        ? ensureStateAndActionsAreImmutable(rootStateOperations)
        : rootStateOperations;
    } else {
      return rootStateOperations;
    }
  }

  setStateToTheCurrentWithNew(results: StatesAndDefaults): void {
    const stateOperations: StateOperations<any> = this.getRootStateOperations();

    // Get our current stream
    const currentState = stateOperations.getState();
    // Set the state to the current + new
    stateOperations.setState({ ...currentState, ...results.defaults });
  }
}

function ensureStateAndActionsAreImmutable(root: StateOperations<any>): StateOperations<any> {
  return {
    getState: () => root.getState(),
    setState: value => {
      const frozenValue = deepFreeze(value);
      return root.setState(frozenValue);
    },
    dispatch: (actions, dispatchOptions) => {
      return root.dispatch(actions, dispatchOptions);
    }
  };
}

import { Injectable } from '@angular/core';

import { StateOperations } from '../internal/internals';
import { InternalDispatcher } from '../internal/dispatcher';
import { StateStream } from './state-stream';
import { NgxsConfig } from '../symbols';
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
      setState: newState => this._stateStream.next(newState),
      dispatch: actions => this._dispatcher.dispatch(actions)
    };

    if (this._config.developmentMode) {
      return this.ensureStateAndActionsAreImmutable(rootStateOperations);
    }

    return rootStateOperations;
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

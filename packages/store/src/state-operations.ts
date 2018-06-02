import { Injectable } from '@angular/core';

import { StateOperations } from './internals';
import { InternalDispatcher } from './dispatcher';
import { StateStream } from './state-stream';

/**
 * State Context factory class
 * @ignore
 */
@Injectable()
export class InternalStateOperations {
  constructor(private _stateStream: StateStream, private _dispatcher: InternalDispatcher) {}

  public getRootStateOperations(): StateOperations<any> {
    const rootStateOperations = {
      getState: () => this._stateStream.getValue(),
      setState: newState => this._stateStream.next(newState),
      dispatch: actions => this._dispatcher.dispatch(actions)
    };

    return rootStateOperations;
  }
}

import { Injectable } from '@angular/core';

import { StateOperations } from './symbols';
import { InternalDispatcher } from './dispatcher';
import { StateStream } from './state-stream';
import { PluginManager } from './plugin-manager';

/**
 * State Context factory class
 * @ignore
 */
@Injectable()
export class InternalStateOperations {
  constructor(
    private _stateStream: StateStream,
    private _dispatcher: InternalDispatcher,
    private _pluginManager: PluginManager
  ) {}

  public getRootStateOperations(): StateOperations<any> {
    const rootStateOperations = {
      getState: () => this._stateStream.getValue(),
      setState: newState => this._stateStream.next(newState),
      dispatch: actions => this._dispatcher.dispatch(actions)
    };

    const finalRootOperationOutputs = this._pluginManager.stateOperationsPlugins.reduce(
      (prev, fn) => fn(prev),
      rootStateOperations
    );

    return {
      getState: () => finalRootOperationOutputs.getState(),
      setState: newState => finalRootOperationOutputs.setState(newState),
      dispatch: actions => finalRootOperationOutputs.dispatch(actions)
    };
  }
}

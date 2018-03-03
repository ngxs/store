import { Injectable } from '@angular/core';
import { EventStream } from './event-stream';
import { StoreFactory } from './factory';
import { StateStream } from './state-stream';
import { PluginManager } from './plugin-manager';
import { Observable } from 'rxjs/Observable';
import { distinctUntilChanged, materialize } from 'rxjs/operators';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { Subject } from 'rxjs/Subject';
import { map } from 'rxjs/operator/map';
import { fromPromise } from 'rxjs/observable/fromPromise';
import { compose } from './compose';

@Injectable()
export class Ngxs {
  constructor(
    private _eventStream: EventStream,
    private _storeFactory: StoreFactory,
    private _stateStream: StateStream,
    private _pluginManager: PluginManager
  ) {}

  /**
   * Dispatchess an event(s).
   */
  dispatch(action: any | any[]): Observable<any> {
    if (Array.isArray(action)) {
      return forkJoin(action.map(a => this._dispatch(a)));
    } else {
      return this._dispatch(action);
    }
  }

  /**
   * Selects a slice of data from the store.
   */
  select(mapFn) {
    return map.call(this._stateStream, mapFn).pipe(distinctUntilChanged.call(this._stateStream));
  }

  private _dispatch(action) {
    const curState = this._stateStream.getValue();

    const plugins = this._pluginManager.plugins;
    const nextState = compose([...plugins, this._dispatchMutation.bind(this)])(curState, action);

    const results: any[] = this._storeFactory.invokeActions(nextState, action);
    if (results.length) {
      return forkJoin(this._handleNesting(results));
    }

    const resultStream = new Subject();
    resultStream.next();
    resultStream.complete();
    return resultStream;
  }

  private _dispatchMutation(state, action) {
    this._eventStream.next(action);
    const newState = this._storeFactory.invokeMutations(state, action);
    this._stateStream.next(newState);
    return newState;
  }

  private _handleNesting(actionResults) {
    const results: any[] = [];
    for (const actionResult of actionResults) {
      if (actionResult.subscribe) {
        const actionResultStream = new Subject();
        actionResult.pipe(materialize()).subscribe(res => {
          if (res.value) {
            this.dispatch(res.value).subscribe(() => {
              actionResultStream.next();
              actionResultStream.complete();
            });
          } else {
            actionResultStream.next();
            actionResultStream.complete();
          }
        });
        results.push(actionResultStream);
      } else if (actionResult.then) {
        results.push(fromPromise(actionResult));
      } else {
        results.push(this.dispatch(actionResult));
      }
    }
    return results;
  }
}

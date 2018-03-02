import { Injectable } from '@angular/core';
import { EventStream } from './event-stream';
import { StoreFactory } from './factory';
import { StateStream } from './state-stream';
import { PluginManager } from './plugin-manager';
import { Observable } from 'rxjs/Observable';
import { distinctUntilChanged, map, materialize } from 'rxjs/operators';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { Subject } from 'rxjs/Subject';
import { fromPromise } from 'rxjs/observable/fromPromise';

@Injectable()
export class Ngxs {
  constructor(
    private _eventStream: EventStream,
    private _storeFactory: StoreFactory,
    private _stateStream: StateStream,
    private _pluginManager: PluginManager
  ) {}

  dispatch(action: any | any[]): Observable<any> {
    if (Array.isArray(action)) {
      return forkJoin(action.map(a => this._dispatch(a)));
    } else {
      return this._dispatch(action);
    }
  }

  select(mapFn) {
    return map.call(this._stateStream, mapFn).pipe(distinctUntilChanged.call(this._stateStream));
  }

  private _dispatch(action) {
    this._eventStream.next(action);

    const curState = this._stateStream.getValue();
    const newState = this._storeFactory.invokeMutations(curState, action);
    this._stateStream.next(newState);

    const results: any[] = this._storeFactory.invokeActions(newState, action);

    for (const plugin of this._pluginManager.plugins) {
      const res = plugin.handle(newState, action);
      if (res) {
        results.push(...this._handleNesting([res]));
      }
    }

    if (results.length) {
      return forkJoin(this._handleNesting(results));
    }

    const resultStream = new Subject();
    resultStream.next();
    resultStream.complete();
    return resultStream;
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

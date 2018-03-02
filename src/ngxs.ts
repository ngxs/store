import { Injectable, Optional, Inject } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { EventStream } from './event-stream';
import { StoreFactory } from './factory';
import { scan, distinctUntilChanged, materialize } from 'rxjs/operators';
import { map } from 'rxjs/operator/map';
import { StateStream } from './state-stream';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { fromPromise } from 'rxjs/observable/fromPromise';
import { Observable } from 'rxjs/Observable';
import { STORE_OPTIONS_TOKEN, StoreOptions, LAZY_STORE_OPTIONS_TOKEN } from './symbols';

@Injectable()
export class Ngxs {
  constructor(
    private _eventStream: EventStream,
    private _storeFactory: StoreFactory,
    private _stateStream: StateStream,
    @Optional()
    @Inject(STORE_OPTIONS_TOKEN)
    private _storeOptions: StoreOptions,
    @Optional()
    @Inject(LAZY_STORE_OPTIONS_TOKEN)
    private _featureStoreOptions: StoreOptions
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

    const results = this._storeFactory.invokeActions(newState, action);
    const plugins = [
      ...(this._storeOptions && this._storeOptions.plugins ? this._storeOptions.plugins : []),
      ...(this._featureStoreOptions && this._featureStoreOptions.plugins ? this._featureStoreOptions.plugins : [])
    ];

    if (plugins) {
      for (const plugin of plugins) {
        const res = plugin.handle(newState, action);
        if (res) {
          results.push(...this._handleNesting([res]));
        }
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
    const results = [];
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

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
   * Dispatches an event(s).
   */
  dispatch(event: any | any[]): Observable<any> {
    if (Array.isArray(event)) {
      return forkJoin(event.map(a => this._dispatch(a)));
    } else {
      return this._dispatch(event);
    }
  }

  /**
   * Selects a slice of data from the store.
   */
  select(mapFn) {
    return map.call(this._stateStream, mapFn).pipe(distinctUntilChanged.call(this._stateStream));
  }

  private _dispatch(event) {
    const curState = this._stateStream.getValue();

    const plugins = this._pluginManager.plugins;
    const nextState = compose([...plugins, this._dispatchMutation.bind(this)])(curState, event);

    const results: any[] = this._storeFactory.invokeEvents(nextState, event);
    if (results.length) {
      return forkJoin(this._handleNesting(results));
    }

    const resultStream = new Subject();
    resultStream.next();
    resultStream.complete();
    return resultStream;
  }

  private _dispatchMutation(state, event) {
    this._eventStream.next(event);
    const newState = this._storeFactory.invokeMutations(state, event);
    this._stateStream.next(newState);
    return newState;
  }

  private _handleNesting(eventResults) {
    const results: any[] = [];
    for (const eventResult of eventResults) {
      if (eventResult.subscribe) {
        const eventResultStream = new Subject();
        eventResult.pipe(materialize()).subscribe(res => {
          if (res.value) {
            this.dispatch(res.value).subscribe(() => {
              eventResultStream.next();
              eventResultStream.complete();
            });
          } else {
            eventResultStream.next();
            eventResultStream.complete();
          }
        });
        results.push(eventResultStream);
      } else if (eventResult.then) {
        results.push(fromPromise(eventResult));
      } else {
        results.push(this.dispatch(eventResult));
      }
    }
    return results;
  }
}

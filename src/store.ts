import { Injectable, ErrorHandler } from '@angular/core';
import { EventStream } from './event-stream';
import { StoreFactory } from './factory';
import { StateStream } from './state-stream';
import { PluginManager } from './plugin-manager';
import { Observable } from 'rxjs/Observable';
import { distinctUntilChanged, materialize, catchError } from 'rxjs/operators';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { Subject } from 'rxjs/Subject';
import { map } from 'rxjs/operators/map';
import { fromPromise } from 'rxjs/observable/fromPromise';
import { compose } from './compose';
import { of } from 'rxjs/observable/of';

@Injectable()
export class Store {
  constructor(
    private _errorHandler: ErrorHandler,
    private _eventStream: EventStream,
    private _storeFactory: StoreFactory,
    private _stateStream: StateStream,
    private _pluginManager: PluginManager
  ) {}

  /**
   * Dispatches an event(s).
   */
  dispatch(event: any | any[]): Observable<any> {
    let result;
    if (Array.isArray(event)) {
      result = forkJoin(event.map(a => this._dispatch(a)));
    } else {
      result = this._dispatch(event);
    }

    result.pipe(
      catchError(err => {
        // handle error through angular error system
        this._errorHandler.handleError(err);
        return of(err);
      })
    );

    return result;
  }

  /**
   * Selects a slice of data from the store.
   */
  select(mapFn) {
    return this._stateStream.pipe(map(mapFn), distinctUntilChanged());
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
    for (let eventResult of eventResults) {
      if (eventResult instanceof Promise) {
        eventResult = fromPromise(eventResult);
      }

      if (eventResult instanceof Observable) {
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
      } else {
        results.push(this.dispatch(eventResult));
      }
    }
    return results;
  }
}

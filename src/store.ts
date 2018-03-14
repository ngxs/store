import { Injectable, ErrorHandler } from '@angular/core';
import { EventStream } from './event-stream';
import { StateFactory } from './state-factory';
import { StateStream } from './state-stream';
import { PluginManager } from './plugin-manager';
import { Observable } from 'rxjs/Observable';
import { distinctUntilChanged, materialize, catchError, take, tap } from 'rxjs/operators';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { Subject } from 'rxjs/Subject';
import { map } from 'rxjs/operators/map';
import { fromPromise } from 'rxjs/observable/fromPromise';
import { compose } from './compose';
import { of } from 'rxjs/observable/of';
import { empty } from 'rxjs/observable/empty';

@Injectable()
export class Store {
  constructor(
    private _errorHandler: ErrorHandler,
    private _eventStream: EventStream,
    private _storeFactory: StateFactory,
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

    // noop subscribe
    result.subscribe(() => {});

    return result;
  }

  /**
   * Selects a slice of data from the store.
   */
  select(mapFn): Observable<any> {
    return this._stateStream.pipe(map(mapFn), distinctUntilChanged());
  }

  /**
   * Select one slice of data from the store.
   */
  selectOnce(mapFn): Observable<any> {
    return this.select(mapFn).pipe(take(1));
  }

  private _dispatch(action): Observable<any> {
    const prevState = this._stateStream.getValue();
    const plugins = this._pluginManager.plugins;

    return compose([
      ...plugins,
      (nextState, nextAction) => {
        if (nextState !== prevState) {
          this._stateStream.next(nextState);
        }

        this._eventStream.next(event);

        return this._dispatchActions(nextAction).pipe(materialize(), map(() => this._stateStream.getValue()));
      }
    ])(prevState, action);
  }

  private _dispatchActions(action): Observable<any> {
    const results = this._storeFactory.invokeActions(
      () => this._stateStream.getValue(),
      newState => this._stateStream.next(newState),
      action
    );

    return results.length ? forkJoin(this._handleNesting(results)) : empty();
  }

  private _handleNesting(eventResults): Observable<any>[] {
    const results = [];
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
      }
    }
    return results;
  }
}

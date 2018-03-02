import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { ActionStream } from './action-stream';
import { ReducerFactory } from './reducer-factory';
import { scan, takeUntil, distinctUntilChanged } from 'rxjs/operators';
import { map } from 'rxjs/operator/map';

@Injectable()
export class Store {
  private _destroy$ = new Subject();

  constructor(private _actionStream: ActionStream, private _reducerFactory: ReducerFactory) {
    this._actionStream
      .pipe(
        scan((state, action) => {
          const next = this._reducerFactory.invokeMutations(state, action);
          this._reducerFactory.invokeActions(next, action, this.dispatch.bind(this));
          return next;
        }),
        takeUntil(this._destroy$)
      )
      .subscribe(() => {});
  }

  dispatch(action: any | any[]) {
    if (Array.isArray(action)) {
      action.forEach(a => this._actionStream.next(a));
    } else {
      this._actionStream.next(action);
    }
  }

  select(mapFn) {
    return map.call(this._actionStream, mapFn).pipe(distinctUntilChanged.call(this._actionStream));
  }
}

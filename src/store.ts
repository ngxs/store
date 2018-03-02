import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { ActionStream } from './action-stream';
import { ReducerFactory } from './reducer-factory';
import { scan, takeUntil, distinctUntilChanged } from 'rxjs/operators';
import { map } from 'rxjs/operator/map';
import { StateStream } from './state-stream';

@Injectable()
export class Store {
  private _destroy$ = new Subject();

  constructor(
    private _actionStream: ActionStream,
    private _reducerFactory: ReducerFactory,
    private _stateStream: StateStream
  ) {
    this._actionStream
      .pipe(
        scan((prevAction, nextAction) => {
          const curState = this._stateStream.getValue();
          const newState = this._reducerFactory.invokeMutations(curState, nextAction);
          this._stateStream.next(newState);
          this._reducerFactory.invokeActions(newState, nextAction, this.dispatch.bind(this));
          return nextAction;
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
    return map.call(this._stateStream, mapFn).pipe(distinctUntilChanged.call(this._stateStream));
  }
}

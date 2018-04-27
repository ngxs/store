import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

/**
 * Status of a dispatched action
 */
export enum ActionStatus {
  Dispatched = 'DISPATCHED',
  Completed = 'COMPLETED',
  Canceled = 'CANCELED',
  Errored = 'ERRORED'
}

export interface ActionContext {
  status: ActionStatus;
  action: any;
}

export class OrderedSubject<T> extends Subject<T> {
  private _itemQueue: T[] = [];
  private _busyPushingNext = false;

  next(value?: T): void {
    if (this._busyPushingNext) {
      this._itemQueue.unshift(value);
      return;
    }
    this._busyPushingNext = true;
    super.next(value);
    while (this._itemQueue.length > 0) {
      const nextValue = this._itemQueue.pop();
      super.next(nextValue);
    }
    this._busyPushingNext = false;
  }
}

/**
 * Internal Action stream that is emitted anytime an action is dispatched.
 */
@Injectable()
export class InternalActions extends OrderedSubject<ActionContext> {}

/**
 * Action stream that is emitted anytime an action is dispatched.
 *
 * You can listen to this in services to react without stores.
 */
@Injectable()
export class Actions extends Observable<any> {
  constructor(actions$: InternalActions) {
    super(observer => {
      actions$.subscribe(res => observer.next(res), err => observer.error(err), () => observer.complete());
    });
  }
}

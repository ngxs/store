import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

import { leaveNgxs } from './operators/leave-ngxs';
import { InternalNgxsExecutionStrategy } from './execution/internal-ngxs-execution-strategy';

/**
 * Status of a dispatched action
 */
export const enum ActionStatus {
  Dispatched = 'DISPATCHED',
  Successful = 'SUCCESSFUL',
  Canceled = 'CANCELED',
  Errored = 'ERRORED'
}

export interface ActionContext<T = any> {
  status: ActionStatus;
  action: T;
  error?: Error;
}

/**
 * Custom Subject that ensures that subscribers are notified of values in the order that they arrived.
 * A standard Subject does not have this guarantee.
 * For example, given the following code:
 * ```typescript
 *   const subject = new Subject<string>();
     subject.subscribe(value => {
       if (value === 'start') subject.next('end');
     });
     subject.subscribe(value => { });
     subject.next('start');
 * ```
 * When `subject` is a standard `Subject<T>` the second subscriber would recieve `end` and then `start`.
 * When `subject` is a `OrderedSubject<T>` the second subscriber would recieve `start` and then `end`.
 */
export class OrderedSubject<T> extends Subject<T> {
  private _itemQueue: T[] = [];
  private _busyPushingNext = false;

  next(value?: T): void {
    if (this._busyPushingNext) {
      this._itemQueue.unshift(value!);
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
  // This has to be `Observable<ActionContext>` in the v4. Because `InternalActions`
  // is a `Subject<ActionContext>`. Leave it as `any` to avoid breaking changes
  constructor(
    internalActions$: InternalActions,
    internalExecutionStrategy: InternalNgxsExecutionStrategy
  ) {
    super(observer => {
      const childSubscription = internalActions$
        .pipe(leaveNgxs(internalExecutionStrategy))
        .subscribe({
          next: ctx => observer.next(ctx),
          error: error => observer.error(error),
          complete: () => observer.complete()
        });

      observer.add(childSubscription);
    });
  }
}

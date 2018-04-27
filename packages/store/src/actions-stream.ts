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

/**
 * Internal Action stream that is emitted anytime an action is dispatched.
 */
@Injectable()
export class InternalActions extends Subject<ActionContext> {}

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

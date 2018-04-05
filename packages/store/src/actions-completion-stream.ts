import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

/**
 * Internal Action stream that is emitted anytime an action is completed.
 */
@Injectable()
export class InternalActionCompletions extends Subject<any> {}

/**
 * Action stream that is emitted anytime an action is completed.
 *
 * You can listen to this in services to react without stores.
 */
@Injectable()
export class ActionCompletions extends Observable<any> {
  constructor(actions$: InternalActionCompletions) {
    super(observer => {
      actions$.subscribe(res => observer.next(res), err => observer.error(err), () => observer.complete());
    });
  }
}

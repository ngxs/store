import { DestroyRef, inject, Injectable } from '@angular/core';
import { ɵOrderedSubject } from '@ngxs/store/internals';
import { Observable, Subject, share } from 'rxjs';

import { leaveNgxs } from './operators/leave-ngxs';
import { NGXS_EXECUTION_STRATEGY } from './execution/symbols';

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
 * Internal Action stream that is emitted anytime an action is dispatched.
 */
@Injectable({ providedIn: 'root' })
export class InternalActions extends ɵOrderedSubject<ActionContext> {
  // This subject will be the first to know about the dispatched action, its purpose is for
  // any logic that must be executed before action handlers are invoked (i.e., cancelation).
  readonly dispatched$ = new Subject<ActionContext>();

  constructor() {
    super();

    this.subscribe(ctx => {
      if (ctx.status === ActionStatus.Dispatched) {
        this.dispatched$.next(ctx);
      }
    });

    const destroyRef = inject(DestroyRef);
    destroyRef.onDestroy(() => {
      // Complete the subject once the root injector is destroyed to ensure
      // there are no active subscribers that would receive events or perform
      // any actions after the application is destroyed.
      this.complete();
      this.dispatched$.complete();
    });
  }
}

/**
 * Action stream that is emitted anytime an action is dispatched.
 *
 * You can listen to this in services to react without stores.
 */
@Injectable({ providedIn: 'root' })
export class Actions extends Observable<ActionContext> {
  constructor() {
    const internalActions$ = inject(InternalActions);
    const internalExecutionStrategy = inject(NGXS_EXECUTION_STRATEGY);

    const sharedInternalActions$ = internalActions$.pipe(
      leaveNgxs(internalExecutionStrategy),
      // The `InternalActions` subject emits outside of the Angular zone.
      // We have to re-enter the Angular zone for any incoming consumer.
      // The `share()` operator reduces the number of change detections.
      // This would call leave only once for any stream emission across all active subscribers.
      share()
    );

    super(observer => {
      const childSubscription = sharedInternalActions$.subscribe({
        next: ctx => observer.next(ctx),
        error: error => observer.error(error),
        complete: () => observer.complete()
      });

      observer.add(childSubscription);
    });
  }
}

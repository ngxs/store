import { DestroyRef, inject, Injectable } from '@angular/core';
import { ɵOrderedSubject } from '@ngxs/store/internals';
import { Observable, Subject } from 'rxjs';

import { leaveNgxs } from './operators/leave-ngxs';
import { InternalNgxsExecutionStrategy } from './execution/execution-strategy';

/**
 * Status of a dispatched action
 */
export enum ActionStatus {
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
    const internalExecutionStrategy = inject(InternalNgxsExecutionStrategy);

    // The `InternalActions` subject emits outside of the Angular zone.
    // We have to re-enter the Angular zone for any incoming consumer.
    // The shared `Subject` reduces the number of change detections.
    // This would call leave only once for any stream emission across all active subscribers.
    const sharedInternalActions$ = new Subject<ActionContext>();

    internalActions$
      .pipe(leaveNgxs(internalExecutionStrategy))
      .subscribe(sharedInternalActions$);

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

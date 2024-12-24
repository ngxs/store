import { DestroyRef, inject, Injectable, Signal, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import { ɵwrapObserverCalls } from './custom-rxjs-operators';
import { ɵOrderedBehaviorSubject } from './custom-rxjs-subjects';
import { ɵPlainObject } from './symbols';

/**
 * BehaviorSubject of the entire state.
 * @ignore
 */
@Injectable({ providedIn: 'root' })
export class ɵStateStream extends ɵOrderedBehaviorSubject<ɵPlainObject> {
  readonly state: Signal<ɵPlainObject> = toSignal(this.pipe(ɵwrapObserverCalls(untracked)), {
    manualCleanup: true,
    requireSync: true
  });

  constructor() {
    super({});

    // Complete the subject once the root injector is destroyed to ensure
    // there are no active subscribers that would receive events or perform
    // any actions after the application is destroyed.
    // The `StateStream` should never emit values once the root view is removed,
    // such as when the `ApplicationRef.destroy()` method is called. This is crucial
    // for preventing memory leaks in server-side rendered apps, where a new `StateStream`
    // is created for each HTTP request. If users forget to unsubscribe from `store.select`
    // or `store.subscribe`, it can result in significant memory leaks in SSR apps.
    inject(DestroyRef).onDestroy(() => this.complete());
  }
}

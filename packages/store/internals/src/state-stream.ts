import { DestroyRef, inject, Injectable, Signal, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import { ɵOrderedBehaviorSubject } from './custom-rxjs-subjects';
import { ɵPlainObject } from './symbols';

/**
 * BehaviorSubject of the entire state.
 * @ignore
 */
@Injectable({ providedIn: 'root' })
export class ɵStateStream extends ɵOrderedBehaviorSubject<ɵPlainObject> {
  readonly state: Signal<ɵPlainObject> = toSignal(this, {
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

  override next(value: ɵPlainObject): void {
    // Without `untracked()`, if some signal happened to be
    // read while computing the next state (e.g. reducers/selectors
    // reading other signals before calling `stateStream.next()`),
    // Angular would incorrectly record a dependency on that signal.
    untracked(() => super.next(value));
  }

  override complete(): void {
    untracked(() => super.complete());
  }
}

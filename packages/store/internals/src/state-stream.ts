import { Injectable, OnDestroy, Signal, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import { ɵwrapObserverCalls } from './custom-rxjs-operators';
import { ɵOrderedBehaviorSubject } from './custom-rxjs-subjects';
import { ɵPlainObject } from './symbols';

/**
 * BehaviorSubject of the entire state.
 * @ignore
 */
@Injectable({ providedIn: 'root' })
export class ɵStateStream extends ɵOrderedBehaviorSubject<ɵPlainObject> implements OnDestroy {
  readonly state: Signal<ɵPlainObject> = toSignal(this.pipe(ɵwrapObserverCalls(untracked)), {
    manualCleanup: true,
    requireSync: true
  });

  constructor() {
    super({});
  }

  ngOnDestroy(): void {
    // The StateStream should never emit values once the root view is removed,
    // such as when the `NgModuleRef.destroy()` method is called. This is crucial
    // for preventing memory leaks in server-side rendered apps, where a new StateStream
    // is created for each HTTP request. If users forget to unsubscribe from `store.select`
    // or `store.subscribe`, it can result in significant memory leaks in SSR apps.
    this.complete();
  }
}

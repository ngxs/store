import { Injectable, OnDestroy, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { asapScheduler, observeOn } from 'rxjs';

import { ɵPlainObject } from './symbols';
import { ɵOrderedBehaviorSubject } from './custom-rxjs-subjects';

/**
 * BehaviorSubject of the entire state.
 * @ignore
 */
@Injectable({ providedIn: 'root' })
export class ɵStateStream extends ɵOrderedBehaviorSubject<ɵPlainObject> implements OnDestroy {
  readonly state: Signal<ɵPlainObject | undefined> = toSignal(
    // This is explicitly piped with the `asapScheduler` to prevent synchronous
    // signal updates. Signal updates occurring within effects can lead to errors
    // stating that signal writes are not permitted in effects. This approach helps
    // decouple signal updates from synchronous changes, ensuring compliance with
    // constraints on updates inside effects.
    this.pipe(observeOn(asapScheduler)),
    {
      manualCleanup: true
    }
  );

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

import { Injectable, OnDestroy } from '@angular/core';

import { PlainObject } from '@ngxs/store/internals';

import { OrderedBehaviorSubject } from './custom-rxjs-subjects';

/**
 * BehaviorSubject of the entire state.
 * @ignore
 */
@Injectable({ providedIn: 'root' })
export class StateStream extends OrderedBehaviorSubject<PlainObject> implements OnDestroy {
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

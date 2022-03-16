import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { PlainObject } from '@ngxs/store/internals';

/**
 * BehaviorSubject of the entire state.
 * @ignore
 */
@Injectable()
export class StateStream extends BehaviorSubject<PlainObject> implements OnDestroy {
  constructor() {
    super({});
  }

  ngOnDestroy(): void {
    // The `StateStream` should never emit values once the root view is removed, e.g. when the `NgModuleRef.destroy()` is called.
    // This will eliminate memory leaks in server-side rendered apps where the `StateStream` is created per each HTTP request, users
    // might forget to unsubscribe from `store.select` or `store.subscribe`, thus this will lead to huge memory leaks in SSR apps.
    this.complete();
  }
}

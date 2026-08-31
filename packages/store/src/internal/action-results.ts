import { DestroyRef, inject, Injectable } from '@angular/core';
import { Subject } from 'rxjs';

import type { ActionContext } from '../actions-stream';

/**
 * Internal stream of action results - one per completed action. The dispatcher
 * listens here to build the observable that `dispatch(...)` hands back, and then
 * forwards each result onto the main action stream.
 */
@Injectable({ providedIn: 'root' })
export class InternalDispatchedActionResults extends Subject<ActionContext> {
  constructor() {
    super();
    // When the root injector is destroyed, complete the subject so nothing is
    // left subscribed and reacting to events after the app is gone.
    inject(DestroyRef).onDestroy(() => {
      this.complete();
      this.unsubscribe();
    });
  }
}

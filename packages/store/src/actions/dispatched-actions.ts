import { Subject } from 'rxjs';
import { Injectable, OnDestroy } from '@angular/core';

import type { ActionContext } from '../actions-stream';

@Injectable({ providedIn: 'root' })
// This subject is used for cancellation purposes by action handlers.
// This cancels the in-progress action handler once a new action of that
// type is dispatched.
export class ɵNgxsInternalDispatchedActions
  extends Subject<ActionContext>
  implements OnDestroy
{
  ngOnDestroy(): void {
    this.complete();
  }
}

import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

import type { ActionContext } from '../actions-stream';

/**
 * Internal Action result stream that is emitted when an action is completed.
 * This is used as a method of returning the action result to the dispatcher
 * for the observable returned by the dispatch(...) call.
 * The dispatcher then asynchronously pushes the result from this stream onto the main action stream as a result.
 */
@Injectable({ providedIn: 'root' })
export class InternalDispatchedActionResults
  extends Subject<ActionContext>
  implements OnDestroy
{
  ngOnDestroy(): void {
    // Complete the subject once the root injector is destroyed to ensure
    // there are no active subscribers that would receive events or perform
    // any actions after the application is destroyed.
    this.complete();
  }
}

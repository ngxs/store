import { DestroyRef, inject, PendingTasks } from '@angular/core';
import { debounceTime, filter } from 'rxjs';

import { Actions, ActionStatus } from './actions-stream';
import { withNgxsPreboot } from './standalone-features/preboot';

/**
 * This feature that contributes to app stability, which is required during
 * server-side rendering. With asynchronous actions being dispatched and handled,
 * Angular is unaware of them in zoneless mode and doesn't know whether the app is
 * still unstable. This may prematurely serialize the final HTML that is sent to the client.
 * Including `withNgxsPendingTasks` in your `provideStore` for your SSR
 * app will resolve the above issue.
 */
export function withNgxsPendingTasks() {
  return withNgxsPreboot(() => {
    const actions$ = inject(Actions);
    const destroyRef = inject(DestroyRef);
    const pendingTasks = inject(PendingTasks);

    // Removing a pending task via the public API forces a scheduled tick, ensuring that
    // stability is async and delayed until there was at least an opportunity to run
    // application synchronization.
    // Adding a new task every time an action is dispatched drastically increases the
    // number of change detection cycles because removing a task schedules a new change
    // detection cycle.
    // If 10 actions are dispatched with synchronous action handlers, this would trigger
    // 10 change detection cycles in a row, potentially leading to an
    // `INFINITE_CHANGE_DETECTION` error.
    let removeTaskFn: VoidFunction | null = null;

    const uncompletedActions = new Set<any>();

    destroyRef.onDestroy(() => {
      // If the app is forcely destroyed before all actions are completed,
      // we clean up the set of actions being executed to prevent memory leaks
      // and remove the pending task to stabilize the app.
      uncompletedActions.clear();
      removeTaskFn?.();
      removeTaskFn = null;
    });

    actions$
      .pipe(
        filter(ctx => {
          if (ctx.status === ActionStatus.Dispatched) {
            removeTaskFn ||= pendingTasks.add();
            uncompletedActions.add(ctx.action);
            return false;
          } else {
            return true;
          }
        }),
        // Every time an action is completed, we debounce the stream to ensure only one
        // task is removed, even if multiple synchronous actions are completed in a row.
        debounceTime(0)
      )
      .subscribe(ctx => {
        if (!uncompletedActions.has(ctx.action)) {
          return;
        }

        uncompletedActions.delete(ctx.action);

        if (uncompletedActions.size === 0) {
          removeTaskFn?.();
          removeTaskFn = null;
        }
      });
  });
}

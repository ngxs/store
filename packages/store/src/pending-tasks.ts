import { DestroyRef, inject, PendingTasks } from '@angular/core';
import { buffer, debounceTime, filter } from 'rxjs';

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
    // app synchronization.
    // Adding a new task every time an action is dispatched drastically increases the
    // number of change detection cycles because removing a task schedules a new change
    // detection cycle.
    // If 10 actions are dispatched with synchronous action handlers, this would trigger
    // 10 change detection cycles in a row, potentially leading to an
    // `INFINITE_CHANGE_DETECTION` error.
    let removeTask: VoidFunction | null = null;

    const executedActions = new Set<unknown>();

    // If the app is forcely destroyed before all actions are completed,
    // we clean up the set of actions being executed to prevent memory leaks
    // and remove the pending task to stabilize the app.
    destroyRef.onDestroy(() => executedActions.clear());

    actions$
      .pipe(
        filter(context => context.status !== ActionStatus.PreHandler),
        filter(context => {
          if (context.status === ActionStatus.Dispatched) {
            executedActions.add(context.action);
            removeTask ||= pendingTasks.add();
            return false;
          } else {
            return true;
          }
        }),
        // Every time an action is completed, we debounce the stream to ensure only one
        // task is removed, even if multiple synchronous actions are completed in a row.
        // We use `buffer` to collect action contexts because, if we only use
        // `debounceTime(0)`, we may lose action contexts that are never removed from the set.
        buffer(actions$.pipe(debounceTime(0)))
      )
      .subscribe(contexts => {
        for (const context of contexts) {
          if (!executedActions.has(context.action)) {
            continue;
          }

          executedActions.delete(context.action);

          // Mark app as stable once all of the debounced actions have completed.
          if (executedActions.size === 0) {
            removeTask?.();
            removeTask = null;
          }
        }
      });
  });
}

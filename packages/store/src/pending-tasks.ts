import { DestroyRef, inject, NgZone, PendingTasks } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { buffer, debounceTime, filter } from 'rxjs';

import { Actions, ActionStatus } from './actions-stream';
import { withNgxsPreboot } from './standalone-features/preboot';

export interface NgxsPendingTasksOptions {
  /**
   * Maximum time, in milliseconds, to wait for all dispatched actions to
   * complete before the pending task is removed anyway and the app is allowed
   * to become stable.
   *
   * Without this, a single action whose completion context never arrives (for
   * example, a handler that hangs) keeps the app unstable forever, so SSR
   * serialization blocks indefinitely instead of degrading. When the timeout
   * fires, the pending task is dropped so the server can still send a response.
   *
   * Defaults to `0`, which disables the timeout (previous behavior).
   */
  timeout?: number;
}

/**
 * This feature that contributes to app stability, which is required during
 * server-side rendering. With asynchronous actions being dispatched and handled,
 * Angular is unaware of them in zoneless mode and doesn't know whether the app is
 * still unstable. This may prematurely serialize the final HTML that is sent to the client.
 * Including `withNgxsPendingTasks` in your `provideStore` for your SSR
 * app will resolve the above issue.
 *
 * Pass `{ timeout }` to put an upper bound on how long the app is kept unstable,
 * so a hanging action handler can't block SSR serialization forever.
 */
export function withNgxsPendingTasks(options?: NgxsPendingTasksOptions) {
  const timeout = options?.timeout ?? 0;

  return withNgxsPreboot(() => {
    // We silently return instead of logging a warning when not in server mode,
    // as `withNgxsPendingTasks` may legitimately be included in a shared
    // `provideStore` configuration used by both browser and server apps.
    // In the browser, data hydrated from the transfer state is consumed
    // synchronously, so there is no need to contribute to app stability.
    if (typeof ngServerMode === 'undefined' || !ngServerMode) {
      return;
    }

    const actions$ = inject(Actions);
    const pendingTasks = inject(PendingTasks);
    const destroyRef = inject(DestroyRef);
    const ngZone = inject(NgZone);

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

    // Timer that removes the pending task even if some actions never complete.
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const executedActions = new Set<unknown>();

    const clearTimeoutId = () => {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    };

    // Drop the pending task and forget the actions we were still waiting on.
    const stabilize = () => {
      clearTimeoutId();
      executedActions.clear();
      removeTask?.();
      removeTask = null;
    };

    // If the app is forcely destroyed before all actions are completed,
    // we clean up the set of actions being executed to prevent memory leaks
    // and remove the pending task to stabilize the app.
    destroyRef.onDestroy(() => {
      clearTimeoutId();
      executedActions.clear();
    });

    actions$
      .pipe(
        filter(context => {
          if (context.status === ActionStatus.Dispatched) {
            executedActions.add(context.action);
            if (removeTask === null) {
              removeTask = pendingTasks.add();
              // Start the safety timer only when we actually add a task, so a
              // hanging handler can't keep the app unstable past `timeout`.
              // It's scheduled outside the Angular zone so the timer itself
              // isn't tracked as a pending macrotask (which would keep the app
              // unstable and defeat the purpose).
              if (timeout > 0) {
                timeoutId = ngZone.runOutsideAngular(() =>
                  setTimeout(() => {
                    timeoutId = null;
                    if (typeof ngDevMode !== 'undefined' && ngDevMode) {
                      console.warn(
                        `[NGXS]: withNgxsPendingTasks timed out after ${timeout}ms with ` +
                          `${executedActions.size} action(s) still pending. Removing the ` +
                          `pending task so the app can stabilize — a dispatched action ` +
                          `likely never completed.`
                      );
                    }
                    stabilize();
                  }, timeout)
                );
              }
            }
            return false;
          } else {
            return true;
          }
        }),
        // Every time an action is completed, we debounce the stream to ensure only one
        // task is removed, even if multiple synchronous actions are completed in a row.
        // We use `buffer` to collect action contexts because, if we only use
        // `debounceTime(0)`, we may lose action contexts that are never removed from the set.
        buffer(actions$.pipe(debounceTime(0))),
        takeUntilDestroyed(destroyRef)
      )
      .subscribe(contexts => {
        for (const context of contexts) {
          if (!executedActions.has(context.action)) {
            continue;
          }

          executedActions.delete(context.action);

          // Mark app as stable once all of the debounced actions have completed.
          if (executedActions.size === 0) {
            stabilize();
          }
        }
      });
  });
}

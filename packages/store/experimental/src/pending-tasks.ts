import { inject, ExperimentalPendingTasks } from '@angular/core';
import { ActionStatus, Actions, withNgxsPreboot } from '@ngxs/store';

/**
 * This is an experimental feature that contributes to app stability,
 * which is required during server-side rendering. With asynchronous
 * actions being dispatched and handled, Angular is unaware of them in
 * zoneless mode and doesn't know whether the app is still unstable.
 * This may prematurely serialize the final HTML that is sent to the client.
 */
export function withExperimentalNgxsPendingTasks() {
  return withNgxsPreboot(() => {
    const pendingTasks = inject(ExperimentalPendingTasks);
    const actions$ = inject(Actions);

    const actionToRemoveTaskFnMap = new Map<any, () => void>();

    actions$.subscribe(ctx => {
      if (ctx.status === ActionStatus.Dispatched) {
        const removeTaskFn = pendingTasks.add();
        actionToRemoveTaskFnMap.set(ctx.action, removeTaskFn);
      } else {
        const removeTaskFn = actionToRemoveTaskFnMap.get(ctx.action);
        if (typeof removeTaskFn === 'function') {
          removeTaskFn();
          actionToRemoveTaskFnMap.delete(ctx.action);
        }
      }
    });
  });
}

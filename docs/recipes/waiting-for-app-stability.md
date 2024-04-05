# Waiting For App Stability

When zone.js is disabled, Angular lacks awareness of currently executing tasks. However, it provides a built-in service called "pending tasks". When making an HTTP request through the `HttpClient`, Angular adds a pending task until the request is completed. This information is valuable for determining when the app becomes stable, as stability knowledge is essential for both server-side rendering and hydration features.

During server-side rendering, the HTML content is not serialized until `appRef.isStable` emits for the first time. `isStable` doesn't emit until there are no pending tasks, indicating that all asynchronous operations, such as HTTP requests, have completed.

NGXS also executes actions during server-side rendering, and some of these actions may be asynchronous. When zone.js is disabled, the content will be serialized before these actions complete. This means that the server-side rendering process may capture an incomplete or inconsistent state of the application if asynchronous actions are not completed before the content is serialized.

Let's examine the recipe for updating the "pending tasks" state whenever any action is dispatched and completed:

```ts
import {
  ApplicationConfig,
  ApplicationRef,
  inject,
  ɵPendingTasks as PendingTasks
} from '@angular/core';
import { ActionStatus, Actions, provideStore, withNgxsPreboot } from '@ngxs/store';
import { first, takeUntil } from 'rxjs';

export const appConfig: ApplicationConfig = {
  providers: [
    provideStore(
      [],
      withNgxsPreboot(() => {
        const appRef = inject(ApplicationRef);
        const pendingTasks = inject(PendingTasks);
        const actions$ = inject(Actions);

        const isStable$ = appRef.isStable.pipe(first(isStable => isStable));

        const actionToTaskIdMap = new Map<any, number>();

        actions$.pipe(takeUntil(isStable$)).subscribe(ctx => {
          if (ctx.status === ActionStatus.Dispatched) {
            const taskId = pendingTasks.add();
            actionToTaskIdMap.set(ctx.action, taskId);
          } else {
            const taskId = actionToTaskIdMap.get(ctx.action);
            if (typeof taskId === 'number') {
              pendingTasks.remove(taskId);
              actionToTaskIdMap.delete(ctx.action);
            }
          }
        });
      })
    )
  ]
};
```

Please note that the pending tasks service name may differ between Angular versions. Therefore, you need to know whether it's named as follows or has been renamed.

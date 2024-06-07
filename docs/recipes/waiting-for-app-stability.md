# Waiting For App Stability

> :warning: Note that the current recipe may be used starting from Angular 18 because the experimental API was publicly exposed in Angular 18.

When zone.js is disabled, Angular lacks awareness of currently executing tasks. However, it provides a built-in service called [`PendingTasks`](https://angular.dev/api/core/ExperimentalPendingTasks). When making an HTTP request through the `HttpClient`, Angular adds a pending task until the request is completed. This information is valuable for determining when the app becomes stable, as stability knowledge is essential for both server-side rendering and hydration features.

During server-side rendering, the HTML content is not serialized until `appRef.isStable` emits for the first time. `isStable` doesn't emit until there are no pending tasks, indicating that all asynchronous operations, such as HTTP requests, have completed.

NGXS also executes actions during server-side rendering, and some of these actions may be asynchronous. When zone.js is disabled, the content will be serialized before these actions complete. This means that the server-side rendering process may capture an incomplete or inconsistent state of the application if asynchronous actions are not completed before the content is serialized.

Let's examine the recipe for updating the "pending tasks" state whenever any action is dispatched and completed:

```ts
import { ApplicationConfig, inject, ExperimentalPendingTasks } from '@angular/core';
import { ActionStatus, Actions, provideStore, withNgxsPreboot } from '@ngxs/store';

export const appConfig: ApplicationConfig = {
  providers: [
    provideStore(
      [],
      withNgxsPreboot(() => {
        const pendingTasks = inject(ExperimentalPendingTasks);
        const actions$ = inject(Actions);

        const actionToRemoveTaskFnMap = new Map<any, () => void>();

        // Note that you don't have to unsubscribe from the actions stream in
        // this specific case, as we complete the actions subject when the root
        // view is destroyed. In server-side rendering, the root view is destroyed
        // immediately once the app stabilizes and its HTML is serialized.
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
      })
    )
  ]
};
```

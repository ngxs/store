# Zoneless Server-Side Rendering

When zone.js is disabled, Angular lacks awareness of currently executing tasks. However, it provides a built-in service called [`PendingTasks`](https://angular.dev/api/core/ExperimentalPendingTasks). When making an HTTP request through the `HttpClient`, Angular adds a pending task until the request is completed. This information is valuable for determining when the app becomes stable, as stability knowledge is essential for both server-side rendering and hydration features.

During server-side rendering, the HTML content is not serialized until `appRef.isStable` emits for the first time. `isStable` doesn't emit until there are no pending tasks, indicating that all asynchronous operations, such as HTTP requests, have completed.

NGXS also executes actions during server-side rendering, and some of these actions may be asynchronous. When zone.js is disabled, the content will be serialized before these actions complete. This means that the server-side rendering process may capture an incomplete or inconsistent state of the application if asynchronous actions are not completed before the content is serialized.

Let's examine the recipe for updating the "pending tasks" state whenever any action is dispatched and completed:

```ts
import { ApplicationConfig } from '@angular/core';
import { provideStore, withNgxsPendingTasks } from '@ngxs/store';

export const appConfig: ApplicationConfig = {
  providers: [provideStore([], withNgxsPendingTasks())]
};
```

## Timeout

`withNgxsPendingTasks` keeps the app unstable until every dispatched action has completed. If an action is dispatched during server-side rendering and its completion never arrives — for example, a handler that hangs on a request without its own timeout — the app never becomes stable and HTML serialization blocks indefinitely.

Pass a `timeout` (in milliseconds) to put an upper bound on the wait. When the first pending task is added a timer starts, and if it fires before all actions have completed, the pending task is removed anyway so the server can still send a response. In development mode a warning is logged so the hanging action is easy to spot.

```ts
export const appConfig: ApplicationConfig = {
  providers: [provideStore([], withNgxsPendingTasks({ timeout: 5000 }))]
};
```

The timer is scheduled outside the Angular zone, so it doesn't itself count as pending work, and it's cleared as soon as the actions complete normally. The default is `0`, which disables the timeout and keeps the original behavior of waiting indefinitely.

# Monitoring Unhandled Actions

We can know if we have dispatched some actions which haven't been handled by any of the NGXS states. This is useful to monitor if we dispatch actions at the right time. For instance, dispatched actions might be coming from the WebSocket, but the action handler is located within the feature state that has not been registered yet. This will let us know that we should either register the state earlier or do anything else from the code perspective because actions are not being handled.

This may be enabled by importing the `NgxsDevelopmentModule`.

## Ignoring Certain Actions

We can ignore specific actions that should not be logged if they have never been handled. E.g., if we're using the `@ngxs/router-plugin` and don't care about router actions like `RouterNavigation`, then we may add it to the `ignore` array:

```ts
import { NgxsDevelopmentModule } from '@ngxs/store';
import { RouterNavigation, RouterCancel } from '@ngxs/router-plugin';

@NgModule({
  imports: [
    NgxsDevelopmentModule.forRoot({
      warnOnUnhandledActions: {
        ignore: [RouterNavigation, RouterCancel]
      }
    })
  ]
})
export class AppModule {}
```

It's best to import this module only in development mode. This may be achieved using environment imports. See [dynamic plugins](../recipes/dynamic-plugins.md).

Ignored actions can be also expanded in lazy modules. The `@ngxs/store` exposes the `NgxsUnhandledActionsLogger` for these purposes:

```ts
import { Injector } from '@angular/core';
import { NgxsUnhandledActionsLogger } from '@ngxs/store';

declare const ngDevMode: boolean;

@NgModule({
  imports: [NgxsModule.forFeature([LazyState])]
})
export class LazyModule {
  constructor(injector: Injector) {
    if (ngDevMode) {
      const unhandledActionsLogger = injector.get(NgxsUnhandledActionsLogger);
      unhandledActionsLogger.ignoreActions(LazyAction);
    }
  }
}
```

The `ngDevMode` is a specific variable provided by Angular in development mode and by Angular CLI (to Terser) in production mode. This allows tree-shaking `NgxsUnhandledActionsLogger` stuff since the `NgxsDevelopmentModule` is imported only in development mode. It's never functional in production mode.

# Monitoring Unhandled Actions

We can know if we have dispatched some actions which haven't been handled by any of the NGXS states. This is useful to monitor if we dispatch actions at the right time. For instance, dispatched actions might be coming from the WebSocket, but the action handler is located within the feature state that has not been registered yet. This will let us know that we should either register the state earlier or do anything else from the code perspective because actions are not being handled.

This may be enabled by adding the `withNgxsDevelopmentOptions` to `provideStore`:

```ts
import { provideStore, withNgxsDevelopmentOptions } from '@ngxs/store';

export const appConfig: ApplicationConfig = {
  providers: [
    provideStore(
      [],
      withNgxsDevelopmentOptions({
        warnOnUnhandledActions: true
      })
    )
  ]
};
```

If you are still using modules, include the `NgxsDevelopmentModule` plugin in your root app module:

```ts
import { NgxsModule, NgxsDevelopmentModule } from '@ngxs/store';

@NgModule({
  imports: [
    NgxsModule.forRoot([]),
    NgxsDevelopmentModule.forRoot({
      warnOnUnhandledActions: true
    })
  ]
})
export class AppModule {}
```

Setting `warnOnUnhandledActions` to a truthy value will tell the logger to warn on any unhandled action.

## Ignoring Certain Actions

We can ignore specific actions that should not be logged if they have never been handled. For instance, if we're using the `@ngxs/router-plugin` and don't care about router actions like `RouterNavigation`, then we may add it to the `ignore` array:

```ts
import { provideStore, withNgxsDevelopmentOptions } from '@ngxs/store';
import { RouterNavigation, RouterCancel } from '@ngxs/router-plugin';

export const appConfig: ApplicationConfig = {
  providers: [
    provideStore(
      [],
      withNgxsDevelopmentOptions({
        warnOnUnhandledActions: true
      })
    )
  ]
};
```

> 💡 It's best to import this module only in development mode. This may be achieved using environment imports. See [dynamic plugins](../recipes/dynamic-plugins.md).

Ignored actions can be also expanded in lazy modules. The `@ngxs/store` exposes the `NgxsUnhandledActionsLogger` for these purposes:

```ts
import { inject } from '@angular/core';
import { NgxsUnhandledActionsLogger } from '@ngxs/store';

declare const ngDevMode: boolean;

const providers = [provideStates([LazyState])];

if (ngDevMode) {
  providers.push({
    provide: ENVIRONMENT_INITIALIZER,
    multi: true,
    useValue: () => {
      const unhandledActionsLogger = inject(NgxsUnhandledActionsLogger);
      unhandledActionsLogger.ignoreActions(LazyAction);
    }
  });
}

export const routes: Routes = [
  {
    path: '',
    component: LazyComponent,
    providers
  }
];
```

The `ngDevMode` is a specific variable provided by Angular in development mode and by Angular CLI (to Terser) in production mode. This allows tree-shaking `NgxsUnhandledActionsLogger` stuff since the `NgxsDevelopmentModule` is imported only in development mode. It's never functional in production mode.

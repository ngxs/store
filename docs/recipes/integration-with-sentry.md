# Integration with Sentry

If you are using Sentry as your Error Tracker, you can use this recipe to trace and log actions as _breadcrumbs_.

First you'll need to initialize Sentry in your app using `Sentry.init(...)` in the `main.ts` file.

```ts
Sentry.init({
  dsn: ...
  // ...
});
```

Next, you need to provide `Sentry`'s `ErrorHandler` and `TraceService`.

```ts
// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    // ...
    {
      provide: ErrorHandler,
      useValue: Sentry.createErrorHandler()
    },
    {
      provide: Sentry.TraceService,
      deps: [Router]
    },
    provideAppInitializer(() => inject(Sentry.TraceService))
  ]
};

// Or using an old module approach:
// app.module.ts
@NgModule({
  providers: [
    // ...
    {
      provide: ErrorHandler,
      useValue: Sentry.createErrorHandler()
    },
    {
      provide: Sentry.TraceService,
      deps: [Router]
    },
    provideAppInitializer(() => inject(Sentry.TraceService))
  ]
})
export class AppModule {}
```

Now, let's go over how to log NGXS actions as breadcrumbs.
Create a service `NgxsSentryBreadcrumbsService`.
This service uses NGXS `Actions` dependency to listen to all events and send them to Sentry using `Sentry.addBreadcrumb`.

```ts
@Injectable({ providedIn: 'root' })
export class NgxsSentryBreadcrumbsService {
  constructor() {
    const actions$ = inject(Actions);

    const excludeAction = []; // You can add the actions you want to exclude from your breadcrumbs here.
    actions$.subscribe(ctx => {
      const actionType = getActionTypeFromInstance(ctx.action);

      if (!actionType) {
        return;
      }

      if (!excludeActions.some(excludeAction => actionType.startsWith(excludeAction))) {
        Sentry.addBreadcrumb({
          category: 'NGXS',
          message: `${actionType} ${ctx.status}`,
          level: 'info',
          type: 'info',
          data: typeof ctx.action === 'string' ? { data: ctx.action } : ctx.action
        });
      }
    });
  }
}
```

Lastly provide the `NgxsSentryBreadcrumbsService` and include it as dependency of the `APP_INITIALIZER`, this will allow to instantiate the service when the app initializes and starts monitoring and tracing actions as breadcrumns to Sentry.

```ts
provideAppInitializer(() => inject(NgxsSentryBreadcrumbsService));
```

That's it! This is a simple implementation on how to integrate NGXS and Sentry to trace actions as breadcrumbs. This will result in Sentry displaying the executed actions previous to an error.

![NGXS Sentry](../assets/ngxs-sentry-breadcrumbs.png)

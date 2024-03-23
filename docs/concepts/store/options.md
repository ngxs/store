# Options

You can provide an `NgxsModuleOptions` object as the second argument of your `NgxsModule.forRoot` call. The following options are available:

- `developmentMode` - Setting this to `true` will add additional debugging features that are useful for development time. This includes freezing your state and actions to guarantee immutability. (Default value is `false`). This property will be accounted only in development mode when using the Ivy compiler. It makes sense to use it only during development to ensure there're no state mutations. When building for production, the Object.freeze will be tree-shaken away
- `selectorOptions` - A nested options object for providing a global options setting to be used for selectors. This can be overridden at the class or specific selector method level using the `SelectorOptions` decorator. The following options are available:
  - `suppressErrors` - Setting this to `true` will cause any error within a selector to result in the selector returning `undefined`. Setting this to `false` results in these errors propagating through the stack that triggered the evaluation of the selector that caused the error. (Default value is `false`).
  - `injectContainerState` - Setting this to `true` will inject the container state model as the first parameter of a selector method (defined within a state class) that joins to other selectors for its parameters. Note: This property should not be explicitly set by anyone using NGXS v4; it only existed for migrating codebases from v3 to v4.
- `compatibility` - A nested options object that allows for the following compatibility options:
  - `strictContentSecurityPolicy` - Set this to `true` in order to enable support for pages where a Strict Content Security Policy has been enabled. This setting circumvent some optimisations that violate a strict CSP through the use of `new Function(...)`. (Default value is `false`)
- `executionStrategy` - An advanced option that is used to gain specific control over the way that NGXS executes code that is considered to be inside the NGXS context (ie. within `@Action` handlers) and the context under which the NGXS behaviours are observed (outside the NGXS context). These observable behaviours are: `store.select(...)`, `actions.subscribe(...)` or `store.dispatch(...).subscribe(...)`.
  Developers who prefer to manually control the change detection mechanism in their application may choose to use the `NoopNgxsExecutionStrategy` which does not interfere with zones and therefore relies on the external context to handle change detection (for instance, `OnPush`). The `NoopNgxsExecutionStrategy` enforces NGXS handling actions in the same context where `store.dispatch(...)` is being called. This means that given the following invocation:
  ```ts
  ngZone.runOutsideAngular(() => {
    store.dispatch(new LoadBooks());
  });
  ```
  NGXS will handle `LoadBooks` action outside Angular's zone.
  Developers can also choose to implement their own strategy by providing an Angular service class that implements the `NgxsExecutionStrategy` interface. The default value of `null` will result in the default strategy being used. This default strategy runs NGXS operations outside Angular's zone but all observable behaviours of NGXS are run back inside Angular's zone. (The default value is `null`)

`ngxs.config.ts`:

```ts
import { NgxsModuleOptions } from '@ngxs/store';

export const ngxsConfig: NgxsModuleOptions = {
  developmentMode: !environment.production,
  selectorOptions: {
    suppressErrors: false
  },
  compatibility: {
    strictContentSecurityPolicy: true
  },
  // Execution strategy overridden for illustrative purposes
  // (only do this if you know what you are doing)
  executionStrategy: NoopNgxsExecutionStrategy
};
```

`app.config.ts`:

```ts
import { provideStore } from '@ngxs/store';

import { ngxsConfig } from './ngxs.config';
...
export const appConfig: ApplicationConfig = {
  providers: [
    provideStore(states, ngxsConfig)
  ]
};
```

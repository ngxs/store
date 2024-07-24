# Options

You can provide an `NgxsModuleOptions` object as the second argument of your `NgxsModule.forRoot` call. The following options are available:

- `developmentMode` - Setting this to `true` will add additional debugging features that are useful for development time. This includes freezing your state and actions to guarantee immutability. (Default value is `false`). It makes sense to use it only during development to ensure there're no state mutations. When building for production, the `Object.freeze` will be tree-shaken away.
- `selectorOptions` - A nested options object for providing a global options setting to be used for selectors. This can be overridden at the class or specific selector method level using the `SelectorOptions` decorator. The following options are available:
  - `suppressErrors` - Setting this to `true` will cause any error within a selector to result in the selector returning `undefined`. Setting this to `false` results in these errors propagating through the stack that triggered the evaluation of the selector that caused the error. (Default value is `false`).
  - `injectContainerState` ([TO BE DEPRECATED](../../deprecations/inject-container-state-deprecation.md)) - Setting this to `true` will inject the container state model as the first parameter of a selector method (defined within a state class) that joins to other selectors for its parameters. Note: This property should not be explicitly set by anyone using versions of NGXS after v3; it only exists for migrating codebases from v3 to versions after v3. See the deprecation notice for further details.
- `compatibility` - A nested options object that allows for the following compatibility options:
  - `strictContentSecurityPolicy` - Set this to `true` in order to enable support for pages where a Strict Content Security Policy has been enabled. This setting circumvent some optimisations that violate a strict CSP through the use of `new Function(...)`. (Default value is `false`)
- `executionStrategy` (❗) - An advanced option that is used to gain specific control over the way that NGXS executes code that is considered to be inside the NGXS context (ie. within `@Action` handlers) and the context under which the NGXS behaviours are observed (outside the NGXS context). These observable behaviours are: `store.selectSignal(...)`, `store.select(...)`, `actions.subscribe(...)` or `store.dispatch(...).subscribe(...)`.
  The `NoopNgxsExecutionStrategy` should be used alongside `provideZonelessChangeDetection`, a feature available starting from Angular v17. This feature offers a zoneless change detection scheduler, making zone.js optional.
  Due to practical considerations and the insights gained from existing implementations of the `executionStrategy` option, developers may find little motivation to create their own execution strategy. Understanding its purpose can be complex, which further discourages developers from undertaking this task.
  If you choose to implement your own strategy, you can provide an Angular service class that implements the `NgxsExecutionStrategy` interface.
  The default value of `null` will result the default strategy being used. This default strategy runs NGXS operations outside Angular's zone but all observable behaviours of NGXS are run back inside Angular's zone. (The default value is `null`).

`ngxs.config.ts`:

> :warning: If your project lacks environment files, you can generate them using the `ng generate environments` command.

```ts
import { NgxsModuleOptions, NoopNgxsExecutionStrategy } from '@ngxs/store';

import { environment } from '../environments/environment';

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

export const appConfig: ApplicationConfig = {
  providers: [provideStore(states, ngxsConfig)]
};
```

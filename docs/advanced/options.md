# Options

You can provide an `NgxsModuleOptions` object as the second argument of your `NgxsModule.forRoot` call. The following options are available:

- `developmentMode` - Setting this to `true` will add additional debugging features that are useful for development time. This includes freezing your state and actions to guarantee immutability. (Default value is `false`)
- `selectorOptions` - A nested options object for providing a global options setting to be used for selectors. This can be overridden at the class or specific selector method level using the `SelectorOptions` decorator. The following options are available:
  - `suppressErrors` - Setting this to `true` will cause any error within a selector to result in the selector returning `undefined`. Setting this to `false` results in these errors propogating through the stack that triggered the evaluation of the selector that caused the error. **NOTE:** *The default for this setting will be changing to `false` in NGXS v4. The default value in NGXS v3.x is `true`.*
  - `injectContainerState` - Setting this to `false` will prevent the injection of the container state model as the first parameter of a selector method (defined within a state class) that joins to other selectors for its parameters. When this setting is `true` all selectors defined within a state class will receive the container class' state model as their first parameter. As a result every selector would be re-evaluated after any change to that state. **NOTE:** *This is not ideal, therefore this setting default will be changing to `false` in NGXS v4. The default value in NGXS v3.x is `true`.*
  - See [here](../concepts/select.md#joining-selectors) for examples of the effect this setting has on your selectors.
- `compatibility` - A nested options object that allows for the following compatibility options:
  - `strictContentSecurityPolicy` - Set this to `true` in order to enable support for pages where a Strict Content Security Policy has been enabled. This setting circumvent some optimisations that violate a strict CSP through the use of `new Function(...)`. (Default value is `false`)
- `executionStrategy` - An advanced option that is used to gain specific control over the way that NGXS executes code that is considered to be inside the NGXS context (ie. within `@Action` handlers) and the context under which the NGXS behaviours are observed (outside the NGXS context). These observable behaviours are: `@Select(...)`, `store.select(...)`, `actions.subscribe(...)` or `store.dispatch(...).subscribe(...)`  
  Developers who prefer to manually control the change detection mechanism in their application may choose to use the `NoopNgxsExecutionStrategy` which does not interfere with zones and therefore relies on the external context to handle change detection (for example: `OnPush` or the Ivy rendering engine). Developers can also choose to implement their own strategy by providing an Angular service class that implements the `NgxsExecutionStrategy` interface. The default value of `null` will result in the default strategy being used. This default strategy runs NGXS operations outside Angular's zone but all observable behaviours of NGXS are run back inside Angular's zone. (The default value is `null`)

ngxs.config.ts

```ts
import { NgxsModuleOptions } from '@ngxs/store';

export const ngxsConfig: NgxsModuleOptions = {
  developmentMode: !environment.production,
  selectorOptions: {
    // These Selector Settings are recommended in preparation for NGXS v4
    // (See above for their effects)
    suppressErrors: false,
    injectContainerState: false
  },
  compatibility: {
    strictContentSecurityPolicy: true
  },
  // Execution strategy overridden for illustrative purposes 
  // (only do this if you know what you are doing)
  executionStrategy: NoopNgxsExecutionStrategy
};
```

app.module.ts

```ts
import { NgxsModule } from '@ngxs/store';
import { ngxsConfig } from './ngxs.config';
...

@NgModule({
  imports: [
    NgxsModule.forRoot(states, ngxsConfig)
  ],
  ...
})
export class AppModule {}
```

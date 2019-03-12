# Options

You can provide a config when you create your root `NgxsModule`, as `forRoot` accepts 2 arguments. The second argument is a `NgxsModuleOptions` object that can have such properties as `developmentMode`, `compatibility` and `executionStrategy`.

- Turning on `developmentMode` option will add additional debugging features, like freezing your state and actions to guarantee immutability. Default value is `false`.
- `compatibility` is an object that can have `strictContentSecurityPolicy` property, if you set `strictContentSecurityPolicy` to `true`, then the support for the strict Content Security Policy will be enabled. This will cirumvent some optimisations that violate a strict CSP through the use of `new Function(...)`. Default value is `false`.
- `executionStrategy` is an advanced option. It is used to have specific control of the way that ngxs executes code that is considered to be inside the ngxs context (ie. within `@Action` handlers) and the context under which the NGXS behaviours are observed (outside the ngxs context). These observable behaviours are: `@Select(...)`, `store.select(...)`, `actions.subscribe(...)` or `store.dispatch(...).subscribe(...)`  
  Developers who prefer to manually control the change detection mechanism in their application may choose to use the `NoopNgxsExecutionStrategy` (or implement their own) which does not interfere with zones and therefore relies on the external context to handle change detection (for example: `OnPush` or ivy's rendering engine). The default value of `null` will result in the default strategy being used. The default strategy runs NGXS operations outside Angular's zone but all observable behaviours of NGXS are run back inside Angular's zone. The default value is `null`.

```TS
@NgModule({
  imports: [
    NgxsModule.forRoot(states, {
      developmentMode: !environment.production,
      compatibility: {
        strictContentSecurityPolicy: true
      },
      executionStrategy: NoopNgxsExecutionStrategy
    })
  ]
})
export class AppModule {}
```

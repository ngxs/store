# Options
You can provide a config when you create your root `NgxsModule`, as `forRoot` accepts 2 arguments. The second argument is a `ModuleOptions` object that can have such properties as `developmentMode`, `compatibility` and `outsideZone`.

* Turning on `developmentMode` option will add additional debugging features, like freezing your state and actions to guarantee immutability. Default value is `false`.
* `compatibility` is an object that can have `strictContentSecurityPolicy` property, if you set `strictContentSecurityPolicy` to `true`, then the support for the strict Content Security Policy will be enabled. This will cirumvent some optimisations that violate a strict CSP through the use of `new Function(...)`. Default value is `false`.
* `outsideZone` is an advanced option, it's suitable for developers who prefer to manually control the change detection mechanism in the applications. All operations will be performed outside Angular's zone, thus `app.tick()` won't be triggered. Don't be worried about server side rendering (Universal), this will not break it, as operations are still proceed inside zone there. Default value is `null`.

```TS
@NgModule({
  imports: [
    NgxsModule.forRoot(states, {
      developmentMode: !environment.production,
      compatibility: {
        strictContentSecurityPolicy: true
      },
      outsideZone: true
    })
  ]
})
export class AppModule {}
```

# Announcing NGXS 3.6

(Intro)

## Overview

- 💥 New lifecycle hook `ngxsOnChanges`
- 💦 Fixed Actions Stream Subscriptions Leak
- 🚧 Improved type safety for children states
- ...
- 🐛 Bug Fixes
- 🔌 Plugin Improvements and Fixes
- 🔬 NGXS Labs Projects Updates

---

## 💥 New lifecycle hook `ngxsOnChanges`

```ts
@State({ .. })
class MyState implements NgxsOnChanges {
  public ngxsOnChanges(change: NgxsSimpleChange): void {
    // ..
  }
}
```

The method receives a NgxsSimpleChanges object of current and previous property values.

```ts
export class NgxsSimpleChange<T = any> {
  constructor(
    public readonly previousValue: T,
    public readonly currentValue: T,
    public readonly firstChange: boolean
  ) {}
}
```

This is convenient if we want to dispatch any additional actions when any fields have changed. Called whenever state change.

#### Lifecycle sequence

After creating the state by calling its constructor, NGXS calls the lifecycle hook methods in the following sequence at specific moments:

| Hook                 | Purpose and Timing                                                        |
| -------------------- | ------------------------------------------------------------------------- |
| ngxsOnChanges()      | Called before ngxsOnInit() and whenever state change.                     |
| ngxsOnInit()         | Called once, after the first ngxsOnChanges().                             |
| ngxsAfterBootstrap() | Called once, after the root view and all its children have been rendered. |

It is necessary in the following use cases:

I. A convenient way to track state changes:

_Before_

```ts
@State({ .. })
class MyState {}

@Component({ })
class MyComponent {
  constructor(store: Store) {
    store.select(MyState).subscribe((newState) => {
       console.log('state is changed', newState);
    })
  }
}
```

One of the problems is, if we do not use the `@ngxs/logger-plugin` or `@ngxs/devtools-plugin`, then we do not know what the previous state was before our state changed. It's great to have such an opportunity out of the box.

_After_

```ts
@State({ .. })
class MyState implements NgxsOnChanges {
  public ngxsOnChanges({ previousValue, currentValue }: NgxsSimpleChange): void {
    console.log('state is changed', previousValue, currentValue);
  }
}
```

Very comfortably!

II. Convenient to synchronize with the server

Sometimes needed to save state on the server every time the client changed it.

_Before_

```ts
@State({ .. })
class MyState {}

@Component({})
class MyComponent {
  constructor(store: Store, api: ApiService) {
    store.select(MyState).subscribe(async newState => {
      await api.save(newState);
    });
  }
}
```

_After_

```ts
@State({ .. })
class MyState implements NgxsOnChanges {
  constructor(api: ApiService) {}
  public async ngxsOnChanges(change: NgxsSimpleChange): void {
    await api.save(change.currentValue);
  }
}
```

III. You can write your own custom logger without another plugins

```ts
@State({ .. })
class MyState implements NgxsOnChanges {
  public ngxsOnChanges({ previousValue, currentValue }: NgxsSimpleChange): void {
    console.log('prev state', previousValue);
    console.log('next state', currentValue);
  }
}
```

## 💦 Fixed Actions Stream Subscriptions Leak

[#1381](https://github.com/ngxs/store/pull/1381)
(Introduction [with problem statement], details and usage)

## 🚧 Improved type safety for children states

[#1388](https://github.com/ngxs/store/pull/1388)
(Introduction [with problem statement], details and usage)

## 🐛 Bug Fixes

For Each:
(Introduction, details and usage)

- Fix: Explicit typings for state operators [#1395](https://github.com/ngxs/store/pull/1395)
- Fix: Warn if the zone is not actual "NgZone" [#1270](https://github.com/ngxs/store/pull/1270)
- Fix: Do not re-throw error to the global handler if custom is provided [#1379](https://github.com/ngxs/store/pull/1379)

## 🔌 Plugin Improvements and Fixes

### HMR Plugin

- Feature: HMR Plugin - Add option for persisting state after the root module is disposed [#1369](https://github.com/ngxs/store/pull/1369)

Previously, if you did a reset of some state in your application, then you could get a side effect:

```ts
@Component({ .. })
class MyComponent implements OnDestroy {
 ...
 public ngOnDestroy(): void {
   this.store.reset({ .. }); // side-effect for HMR Lifecycle
 }
}
```

Accordingly, your application states will be incorrectly works for further operation of the HMR.
Now you can easily control this situation by turning on the flag `persistAfterDestroy`.

```ts
if (environment.hmr) {
  import('@ngxs/hmr-plugin').then(plugin => {
    plugin
      .hmr(module, bootstrap, { persistAfterDestroy: true })
      .catch((err: Error) => console.error(err));
  });
} else {
  bootstrap().catch((err: Error) => console.error(err));
}
```

It is also recommended to use dynamic imports for the HMR plugin, for improved tree-shaking.

### Storage Plugin

- Feature: Storage Plugin - Use state classes as keys [#1380](https://github.com/ngxs/store/pull/1380)

Before that, in order to maintain the state of the application, you had to do so:

```ts
@State<Novel[]>({
  name: 'novels',
  defaults: []
})
export class NovelsState {}
```

```ts
@NgModule({
  imports: [
    NgxsStoragePluginModule.forRoot({
      key: 'novels'
    })
  ]
})
export class AppModule {}
```

Therefore, it is not reliable, since you can change the name of the state and forget to change it in the configuration. Now you just need to pass the reference to the state class and the plugin will automatically use the state name.

```ts
@NgModule({
  imports: [
    NgxsStoragePluginModule.forRoot({
      key: NovelsState
    })
  ]
})
export class AppModule {}
```

### Form Plugin

- Feature: Form Plugin - Implement `propertyPath` parameter in the `UpdateFormValue` [#1215](https://github.com/ngxs/store/pull/1215)

### WebSocket Plugin

- Feature: WebSocket Plugin - Implement `WebSocketConnected` action [#1371](https://github.com/ngxs/store/pull/1371)

---

## 🔬 NGXS Labs Projects Updates

### Labs project `@ngxs-labs/data` created

Announcing [@ngxs-labs/data](https://github.com/ngxs-labs/data)

#### Problem Statement:

...

#### How it addresses this problem:

...

### Labs project `@ngxs-labs/actions-executing` created

Announcing [@ngxs-labs/actions-executing](https://github.com/ngxs-labs/actions-executing)

#### Problem Statement:

...

#### How it addresses this problem:

...

### Labs project x new version released

...

---

## Some Useful Links

If you would like any further information on changes in this release please feel free to have a look at our change log. The code for NGXS is all available at https://github.com/ngxs/store and our docs are available at http://ngxs.io/. We have a thriving community on our slack channel so come and join us to keep abreast with the latest developments. Here is the slack invitation link: https://now-examples-slackin-eqzjxuxoem.now.sh/

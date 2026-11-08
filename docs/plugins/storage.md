# Storage

Back your stores with `localStorage`, `sessionStorage` or any other mechanism you wish.

## Installation

```bash
npm i @ngxs/storage-plugin

# or if you are using yarn
yarn add @ngxs/storage-plugin

# or if you are using pnpm
pnpm i @ngxs/storage-plugin
```

## Usage

When calling `provideStore`, include `withNgxsStoragePlugin` in your app config:

```ts
import { provideStore } from '@ngxs/store';
import { withNgxsStoragePlugin } from '@ngxs/storage-plugin';

export const appConfig: ApplicationConfig = {
  providers: [
    provideStore(
      [],
      withNgxsStoragePlugin({
        keys: '*'
      })
    )
  ]
};
```

If you are still using modules, include the `NgxsStoragePluginModule` plugin in your root app module:

```ts
import { NgxsModule } from '@ngxs/store';
import { NgxsStoragePluginModule } from '@ngxs/storage-plugin';

@NgModule({
  imports: [NgxsModule.forRoot([]), NgxsStoragePluginModule.forRoot({ keys: '*' })]
})
export class AppModule {}
```

It is recommended to register the storage plugin before other plugins so
initial state can be picked up by those plugins.

### Options

The plugin has the following optional values:

- `keys`: State name(s) to be persisted. You can pass an array of strings that can be deeply nested via dot notation. If not provided, you must explicitly specify the `*` option.
- `namespace`: The namespace is used to prefix the key for the state slice. This is necessary when running micro frontend applications which use storage plugin. The namespace will eliminate the conflict between keys that might overlap.
- `storage`: Storage strategy to use. This defaults to LocalStorage but you can pass SessionStorage or anything that implements the StorageEngine API.
- `deserialize`: Custom deserializer. Defaults to `JSON.parse`
- `serialize`: Custom serializer. Defaults to `JSON.stringify`
- `migrations`: Migration strategies
- `beforeSerialize`: Interceptor executed before serialization
- `afterDeserialize`: Interceptor executed after deserialization

### Keys option

The `keys` option is used to determine what states should be persisted in the storage. `keys` shouldn't be a random string, it has to coincide with your state names. Let's look at the below example:

```ts
// novels.state.ts
@State<Novel[]>({
  name: 'novels',
  defaults: []
})
@Service({ autoProvided: false })
export class NovelsState {}

// detectives.state.ts
@State<Detective[]>({
  name: 'detectives',
  defaults: []
})
@Service({ autoProvided: false })
export class DetectivesState {}
```

In order to persist all states, you have to provide `*` as the `keys` option:

```ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideStore(
      [NovelsState, DetectivesState],
      withNgxsStoragePlugin({
        keys: '*'
      })
    )
  ]
};
```

But what if we wanted to persist only `NovelsState`? Then we would have needed to pass its name to the `keys` option:

```ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideStore(
      [NovelsState, DetectivesState],
      withNgxsStoragePlugin({
        keys: ['novels']
      })
    )
  ]
};
```

It's also possible to provide a state class as opposed to its name:

```ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideStore(
      [NovelsState, DetectivesState],
      withNgxsStoragePlugin({
        keys: [NovelsState]
      })
    )
  ]
};
```

And if we wanted to persist `NovelsState` and `DetectivesState`:

```ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideStore(
      [NovelsState, DetectivesState],
      withNgxsStoragePlugin({
        keys: ['novels', 'detectives']
      })
    )
  ]
};
```

Or using state classes:

```ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideStore(
      [NovelsState, DetectivesState],
      withNgxsStoragePlugin({
        keys: [NovelsState, DetectivesState]
      })
    )
  ]
};
```

You can even combine state classes and strings:

```ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideStore(
      [NovelsState, DetectivesState],
      withNgxsStoragePlugin({
        keys: ['novels', DetectivesState]
      })
    )
  ]
};
```

This is very useful for avoiding the persistence of runtime-only states that should not be saved to any storage.

It is also possible to provide storage engines for individual keys. For example, if we want to persist `NovelsState` in the local storage and `DetectivesState` in the session storage, the signature for the key will appear as follows:

```ts
import {
  withNgxsStoragePlugin,
  LOCAL_STORAGE_ENGINE,
  SESSION_STORAGE_ENGINE
} from '@ngxs/storage-plugin';

export const appConfig: ApplicationConfig = {
  providers: [
    provideStore(
      [NovelsState, DetectivesState],
      withNgxsStoragePlugin({
        keys: [
          {
            key: 'novels', // or `NovelsState`
            engine: LOCAL_STORAGE_ENGINE
          },
          {
            key: DetectivesState, // or `detectives`
            engine: SESSION_STORAGE_ENGINE
          }
        ]
      })
    )
  ]
};
```

`LOCAL_STORAGE_ENGINE` and `SESSION_STORAGE_ENGINE` are injection tokens that resolve to `localStorage` and `sessionStorage`, respectively. These tokens should not be used in apps with server-side rendering as it will throw an exception stating that these symbols are not defined in the global scope. Instead, it is recommended to provide a custom storage engine. The `engine` property can also refer to classes that implement the `StorageEngine` interface:

```ts
import { withNgxsStoragePlugin, StorageEngine } from '@ngxs/storage-plugin';

@Injectable({ providedIn: 'root' })
export class MyCustomStorageEngine implements StorageEngine {
  // ...
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideStore(
      [NovelsState, DetectivesState],
      withNgxsStoragePlugin({
        keys: [
          {
            key: 'novels',
            engine: MyCustomStorageEngine
          }
        ]
      })
    )
  ]
};
```

The `engine` property also accepts a factory function `() => StorageEngine`. The function runs in an Angular injection context, so `inject()` is available inside it. This is useful when the same engine class needs different construction arguments for different keys:

```ts
import { inject } from '@angular/core';
import { withNgxsStoragePlugin, StorageEngine } from '@ngxs/storage-plugin';

export class MyCustomStorageEngine implements StorageEngine {
  constructor(private readonly fallback: StorageEngine | null) {}
  // ...
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideStore(
      [NovelsState, DetectivesState],
      withNgxsStoragePlugin({
        keys: [
          {
            key: 'novels',
            engine: () => new MyCustomStorageEngine(inject(SESSION_STORAGE_ENGINE))
          },
          {
            key: 'detectives',
            engine: () => new MyCustomStorageEngine(null) // no fallback storage
          }
        ]
      })
    )
  ]
};
```

### Namespace Option

The namespace option should be provided when the storage plugin is used in micro frontend applications. The namespace may equal the app name and will prefix keys for state slices:

```ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideStore(
      [],
      withNgxsStoragePlugin({
        keys: '*',
        namespace: 'auth'
      })
    )
  ]
};
```

### Custom Storage Engine

You can add your own storage engine by implementing the `StorageEngine` interface:

```ts
import { Service } from '@angular/core';
import { withNgxsStoragePlugin, StorageEngine, STORAGE_ENGINE } from '@ngxs/storage-plugin';

@Service({ autoProvided: false })
export class MyStorageEngine implements StorageEngine {
  getItem(key: string): any {
    // Your logic here
  }

  setItem(key: string, value: any): void {
    // Your logic here
  }
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideStore(
      [],
      withNgxsStoragePlugin({
        keys: '*'
      })
    ),

    {
      provide: STORAGE_ENGINE,
      useClass: MyStorageEngine
    }
  ]
};
```

`STORAGE_ENGINE` is also the token you'd `inject()` if you want to build a custom engine that wraps whatever the plugin is already using, instead of replacing it outright. Since it resolves to `null` on the server (and whenever the `storage` option doesn't resolve to a known engine), treat it as `StorageEngine | null` and guard against `null` wherever you use it:

```ts
import { inject, Injectable } from '@angular/core';
import { StorageEngine, STORAGE_ENGINE } from '@ngxs/storage-plugin';

@Injectable({ providedIn: 'root' })
export class MyWrappingStorageEngine implements StorageEngine {
  private readonly engine = inject(STORAGE_ENGINE);

  getItem(key: string): any {
    return this.engine?.getItem(key);
  }

  setItem(key: string, value: any): void {
    this.engine?.setItem(key, value);
  }
}
```

### Serialization Interceptors

You can define your own logic before or after the state gets serialized or deserialized.

- `beforeSerialize`: Use this option to alter the state before it gets serialized.
- `afterSerialize`: Use this option to alter the state after it gets deserialized. For instance, you can use it to instantiate a concrete class.

```ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideStore(
      [CounterState],
      withNgxsStoragePlugin({
        keys: ['counter'],
        beforeSerialize: (obj, key) => {
          if (key === 'counter') {
            return {
              count: obj.count < 10 ? obj.count : 10
            };
          }
          return obj;
        },
        afterDeserialize: (obj, key) => {
          if (key === 'counter') {
            return new CounterInfoStateModel(obj.count);
          }
          return obj;
        }
      })
    )
  ]
};
```

### Migrations

You can migrate data from one version to another during the startup of the store. Below
is a strategy to migrate my state from `animals` to `newAnimals`.

```ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideStore(
      [],
      withNgxsStoragePlugin({
        keys: '*',
        migrations: [
          {
            version: 1,
            key: 'zoo',
            versionKey: 'myVersion',
            migrate: state => {
              return {
                newAnimals: state.animals,
                version: 2 // Important to set this to the next version!
              };
            }
          }
        ]
      })
    )
  ]
};
```

In the migration strategy, we define:

- `version`: The version we are migrating
- `versionKey`: The identifier for the version key (Defaults to 'version')
- `migrate`: A function that accepts a state and expects the new state in return.
- `key`: The key for the item to migrate. If not specified, it takes the entire storage state.

Note: It's important to specify the strategies in the order of which they should progress.

### Server-Side Rendering

When your app is server-side rendered, the storage plugin cannot help the server. There is no `localStorage` in Node, so `engineFactory` returns `null` and the server renders from plain default state. The browser then takes over, the plugin reads storage on `InitState`, and the state changes to whatever was saved there. The HTML the server sent was built from something else, so the user sees a flash of the wrong content.

`withNgxsStorageTransferState()` closes that gap. On the server it writes the state slices you choose into Angular's `TransferState`, which Angular embeds in the HTML. On the client it reads them back once, before the storage engine, so the browser starts from the same state the server rendered.

```ts
import { provideStore } from '@ngxs/store';
import { withNgxsStoragePlugin, withNgxsStorageTransferState } from '@ngxs/storage-plugin';

export const appConfig: ApplicationConfig = {
  providers: [
    provideStore(
      [],
      withNgxsStoragePlugin(
        { keys: ['auth'] },
        withNgxsStorageTransferState({ keys: ['auth'] })
      )
    )
  ]
};
```

The feature's `keys` have to be a subset of the plugin's own `keys`. It reuses the plugin's `namespace`, `beforeSerialize` and `afterDeserialize`, so there's nothing to configure twice.

For a covered key, the transferred value wins on the first read and is written back to the storage engine, so later reloads see it too. If you want a key seeded from the server but never stored in the browser, add `persist: false`:

```ts
withNgxsStoragePlugin(
  { keys: ['auth', 'website'] },
  withNgxsStorageTransferState({ keys: ['website'], persist: false })
);
```

With `persist: false` the plugin never reads or writes browser storage for that key. It only populates the state from the transfer payload.

**A few things worth knowing:**

- **The transfer payload is public.** Angular embeds it in the HTML, so anyone can read it with view-source, and a CDN may cache it. That's why `keys` is an explicit list, and why `beforeSerialize` is the right place to strip tokens or anything else that shouldn't end up in the page.
- **Prerendering bakes the value in at build time.** A prerendered page ships whatever state your build had, a signed-out session for example, and that value then wins over the visitor's real stored value. The plugin can't detect this, because `ngServerMode` is `true` during prerendering too, and `RenderMode.Prerender` is an `@angular/ssr` routing concept with no runtime signal in `@angular/core`. Keys that depend on the visitor's session need per-request rendering.
- **It only helps state the server can reconstruct.** An auth state the server resolves from a cookie works well. Purely client-side state, such as a theme or a collapsed sidebar, doesn't: the server has nothing to transfer, so the client still reads it from storage after hydration. Think of this as seeding the persisted keys the server already knows, not as SSR support for the whole plugin.
- **`undefined` is not transferred, `null` is.** If a slice is `undefined` on the server, or your `beforeSerialize` returns `undefined`, nothing is transferred for that key and the client falls back to the storage engine. Returning `null` transfers `null`, and the client slice becomes `null`. So don't return `null` from `beforeSerialize` to mean "skip this key", because that would wipe the client's state.
- This feature is currently marked `@experimental`, which means its behavior could still change in a future release.

### Syncing Across Tabs

Imagine you have your app open in two browser tabs at the same time. You log out in one tab — but the other tab has no idea that happened, and still shows you as logged in. That's confusing for users, and it's a common problem with any app that stores data in the browser.

`withNgxsStorageSync()` fixes this. Add it as a feature next to `withNgxsStoragePlugin()`, and whenever one tab writes a persisted value to storage, every other open tab automatically picks up that change too — no page refresh needed.

```ts
import { provideStore } from '@ngxs/store';
import { withNgxsStoragePlugin, withNgxsStorageSync } from '@ngxs/storage-plugin';

export const appConfig: ApplicationConfig = {
  providers: [provideStore([], withNgxsStoragePlugin({ keys: '*' }, withNgxsStorageSync()))]
};
```

That's it — there's nothing else to configure. As long as a key is being persisted by the plugin, it's covered.

**How does it actually work, under the hood?** Browsers have had a built-in way to do this for a long time: whenever `localStorage` or `sessionStorage` changes, every _other_ tab on the same site automatically receives a `storage` event (the tab that made the change does not receive it, only the others). `withNgxsStorageSync()` just listens for that event, checks whether it's one of your persisted keys, and if so, updates your NGXS state to match — the same way your state gets loaded from storage when the app first starts.

**A couple of things worth knowing:**

- This only works for the two storage mechanisms the browser natively supports: `localStorage` and `sessionStorage`. If a key is persisted through your own custom `StorageEngine`, there's no `storage` event for that engine to hook into, so that key won't sync across tabs. (This is a limitation of the browser, not something the plugin could work around.)
- When you persist everything with `keys: '*'`, an incoming change is shallow-merged into the current state, not swapped in wholesale. Slices that exist only in this tab (a lazily loaded feature state the other tab never registered, or state you drop in `beforeSerialize`) are left untouched.
- This feature is currently marked `@experimental`, which means its behavior could still change in a future release.

### Feature States

We can also add states at the feature level when invoking `provideStates`, such as within `Route` providers. This is useful when we want to avoid the root level, responsible for providing the store, from being aware of any feature states. If we do not specify any states to be persisted at the root level, we should specify an empty list:

```ts
import { provideStore } from '@ngxs/store';
import { withNgxsStoragePlugin } from '@ngxs/storage-plugin';

export const appConfig: ApplicationConfig = {
  providers: [provideStore([], withNgxsStoragePlugin({ keys: [] }))]
};
```

If `keys` is an empty list, it indicates that the plugin should not persist any state until it's explicitly added at the feature level.

After registering the `AnimalsState` at the feature level, we also want to persist this state in storage:

```ts
import { provideStates } from '@ngxs/store';
import { withStorageFeature } from '@ngxs/storage-plugin';

export const routes: Routes = [
  {
    path: 'animals',
    loadComponent: () => import('./animals'),
    providers: [provideStates([AnimalsState], withStorageFeature([AnimalsState]))]
  }
];
```

Please note that at the root level, `keys` should not be set to `*` because `*` indicates persisting everything.

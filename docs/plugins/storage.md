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
@Injectable()
export class NovelsState {}

// detectives.state.ts
@State<Detective[]>({
  name: 'detectives',
  defaults: []
})
@Injectable()
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
import { withNgxsStoragePlugin, StorageEngine, STORAGE_ENGINE } from '@ngxs/storage-plugin';

@Injectable()
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

### Serialization Interceptors

You can define your own logic before or after the state get serialized or deserialized.

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

Note: Its important to specify the strategies in the order of which they should progress.

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

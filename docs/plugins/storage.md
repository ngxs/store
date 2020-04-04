# Storage

Back your stores with `localStorage`, `sessionStorage` or any other mechanism you wish.

## Installation

```bash
npm install @ngxs/storage-plugin --save

# or if you are using yarn
yarn add @ngxs/storage-plugin
```

## Usage

Import the `NgxsStoragePluginModule` into your app module like:

```ts
import { NgxsModule } from '@ngxs/store';
import { NgxsStoragePluginModule } from '@ngxs/storage-plugin';

@NgModule({
  imports: [NgxsModule.forRoot([]), NgxsStoragePluginModule.forRoot()]
})
export class AppModule {}
```

It is recommended to register the storage plugin before other plugins so
initial state can be picked up by those plugins.

### Options

The plugin has the following optional values:

- `key`: State name(s) to be persisted. You can pass a string or array of strings that can be deeply nested via dot notation. If not provided, it defaults to all states using the `@@STATE` key.
- `storage`: Storage strategy to use. This defaults to LocalStorage but you can pass SessionStorage or anything that implements the StorageEngine API.
- `deserialize`: Custom deserializer. Defaults to `JSON.parse`
- `serialize`: Custom serializer, defaults to `JSON.stringify`
- `migrations`: Migration strategies

### Key option

The `key` option is used to determine what states should be persisted in the storage. `key` shouldn't be a random string, it has to coincide with your state names. Let's look at the below example:

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

In order to persist all states there is no need to provide the `key` option, so it's enough just to write:

```ts
@NgModule({
  imports: [NgxsStoragePluginModule.forRoot()]
})
export class AppModule {}
```

But what if we wanted to persist only `NovelsState`? Then we would have needed to pass its name to the `key` option:

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

It's also possible to provide a state class as opposed to its name:

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

And if we wanted to persist `NovelsState` and `DetectivesState`:

```ts
@NgModule({
  imports: [
    NgxsStoragePluginModule.forRoot({
      key: ['novels', 'detectives']
    })
  ]
})
export class AppModule {}
```

Or using state classes:

```ts
@NgModule({
  imports: [
    NgxsStoragePluginModule.forRoot({
      key: [NovelsState, DetectivesState]
    })
  ]
})
export class AppModule {}
```

You can even combine state classes and strings:

```ts
@NgModule({
  imports: [
    NgxsStoragePluginModule.forRoot({
      key: ['novels', DetectivesState]
    })
  ]
})
export class AppModule {}
```

This is very handy to avoid persisting runtime-only states that shouldn't be saved to any storage.

### Custom Storage Engine

You can add your own storage engine by implementing the `StorageEngine` interface.

```ts
import { NgxsStoragePluginModule, StorageEngine, STORAGE_ENGINE } from '@ngxs/storage-plugin';

export class MyStorageEngine implements StorageEngine {
  get length(): number {
    // Your logic here
  }

  getItem(key: string): any {
    // Your logic here
  }

  setItem(key: string, val: any): void {
    // Your logic here
  }

  removeItem(key: string): void {
    // Your logic here
  }

  clear(): void {
    // Your logic here
  }

  key(val: number): string {
    // Your logic here
  }
}

@NgModule({
  imports: [NgxsModule.forRoot([]), NgxsStoragePluginModule.forRoot()],
  providers: [
    {
      provide: STORAGE_ENGINE,
      useClass: MyStorageEngine
    }
  ]
})
export class MyModule {}
```

### Serialization

You can define your own logic in case you need to alter the state. For instance, you can
use 'afterDeserialize' to instantiate a concrete class.

```ts
@NgModule({
  imports: [
    NgxsStoragePluginModule.forRoot({
      key: 'counter',
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
  ]
})
export class AppModule {}
```

### Migrations

You can migrate data from one version to another during the startup of the store. Below
is a strategy to migrate my state from `animals` to `newAnimals`.

```ts
@NgModule({
  imports: [
    NgxsModule.forRoot([]),
    NgxsStoragePluginModule.forRoot({
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
  ]
})
export class MyModule {}
```

In the migration strategy, we define:

- `version`: The version we are migrating
- `versionKey`: The identifier for the version key (Defaults to 'version')
- `migrate`: A function that accepts a state and expects the new state in return.
- `key`: The key for the item to migrate. If not specified, it takes the entire storage state.

Note: Its important to specify the strategies in the order of which they should progress.

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

```TS
import { NgxsModule } from '@ngxs/store';
import { NgxsStoragePluginModule } from '@ngxs/storage-plugin';

@NgModule({
  imports: [
    NgxsModule.forRoot([]),
    NgxsStoragePluginModule.forRoot()
  ]
})
export class AppModule {}
```

It is recommended to register the storage plugin before other plugins so
initial state can be picked up by those plugins.

### Options
The plugin has the following optional values:

- `key`: Default key to persist. You can pass a string or array of strings that can be deeply nested via dot notation. If not provided, it defaults to all states using the `@@STATE` key.
- `storage`: Storage strategy to use. This defaults to LocalStorage but you can pass SessionStorage or anything that implements the StorageEngine API.
- `deserialize`: Custom deserializer. Defaults to `JSON.parse`
- `serialize`: Custom serializer, defaults to `JSON.stringify`
- `migrations`: Migration strategies

### Custom Storage Engine
You can implement your own storage engine by providing a engine that
implements `setItem` and `getItem`.

```TS
import { NgxsStoragePluginModule, StorageEngine, STORAGE_ENGINE } from '@ngxs/storage-plugin';

class CustomStorage implements StorageEngine {
      static Storage: any = {
        '@@STATE': {
          count:1,
          counter: {
            count: 100
          }
        }
      };

      get length() {
        return Object.keys(CustomStorage.Storage).length;
      }

      getItem(key) {
        return CustomStorage.Storage[key];
      }

      setItem(key, val) {
        //You can replace this, like localForage
        CustomStorage.Storage[key] = val;
      }

      removeItem(key) {
        delete CustomStorage.Storage[key];
      }

      clear() {
        CustomStorage.Storage = {};
      }

      key(index) {
        return Object.keys(CustomStorage.Storage)[index];
      }
    }

@NgModule({
  imports: [
    NgxsModule.forRoot([]),
    NgxsStoragePluginModule.forRoot({
          serialize(val) {//must set
            return val;
          },
          deserialize(val) {//must set
            return val;
          }
        })
  ],
  providers: [
    {
      provide: STORAGE_ENGINE,
      useClass: CustomStorage
    }
  ]
})
export class MyModule {}
```

### Migrations
You can migrate data from one version to another during the startup of the store. Below
is a strategy to migrate my state from `animals` to `newAnimals`.

```TS
@NgModule({
  imports: [
    NgxsModule.forRoot([]),
    NgxsStoragePluginModule.forRoot({
      migrations: [
        {
          version: 1,
          key: 'zoo',
          versionKey: 'myVersion',
          migrate: (state) => {
            return {
              newAnimals: state.animals,
              version: 2 // Important to set this to the next version!
            }
          }
        }
      ]
    })
  ],
})
export class MyModule {}
```

In the migration strategy, we define:

- `version`: The version we are migrating
- `versionKey`: The identifier for the version key (Defaults to 'version')
- `migrate`: A function that accepts a state and expects the new state in return.
- `key`: The key for the item to migrate. If not specified, it takes the entire storage state.

Note: Its important to specify the strategies in the order of which they should progress.

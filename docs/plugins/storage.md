# Storage
Back your stores with `localStorage`, `sessionStorage` or any other mechanism you wish.

## Install
The Storage plugin can be installed using NPM:

```bash
npm i @ngxs/storage-plugin --S
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

### Custom Storage Engine
You can implement your own storage engine by providing a engine that
implements `setItem` and `getItem`.

```TS
import { NgxsStoragePluginModule, StorageEngine, STORAGE_ENGINE } from '@ngxs/storage-plugin';

export class MyStorageEngine implements StorageEngine {
  getItem(name) {
    // Your logic here
  }

  setItem(key, value) {
    // Your logic here
  }
}

@NgModule({
  imports: [
    NgxsModule.forRoot([]),
    NgxsStoragePluginModule.forRoot()
  ],
  providers: [
    {
      provide: STORAGE_ENGINE,
      useClass: MyStorageEngine
    }
  ]
})
export class MyModule {}
```

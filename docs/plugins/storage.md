# Storage

You can back your stores with localStorage or sessionStorage by including the `NgxsStoragePlugin` plugin.

NOTE: all options are OPTIONAL and are shown with their defaults

```TS
import { NgxsModule } from '@ngxs/store';
import { NgxsLocalStoragePluginModule, StorageOption } from '@ngxs/storage-plugin';

@NgModule({
  imports: [
    NgxsModule.forRoot([]),
    NgxsLocalStoragePluginModule.forRoot({
      /**
       * Default key to persist. You can pass a string or array of strings
       * that can be deeply nested via dot notation.
       */
      key: '@@STATE',

      /**
       * Storage strategy to use. This defaults to LocalStorage but you
       * can pass SessionStorage or anything that implements the StorageEngine API.
       */
      storage: StorageOption.LocalStorage,

      /**
       * Custom deseralizer. Defaults to JSON.parse
       */
      deserialize: JSON.parse,

      /**
       * Custom serializer, defaults to JSON.stringify
       */
      serialize: JSON.stringify,
    })
  ]
})
export class MyModule {}
```

Implementing your own storage mechanism

```TS
import { NgxsLocalStoragePluginModule, StorageEngine, STORAGE_ENGINE } from '@ngxs/storage-plugin';

export class MyStorageEngine implements StorageEngine { ... }

@NgModule({
  imports: [
    NgxsModule.forRoot([]),
    NgxsLocalStoragePluginModule.forRoot(),
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

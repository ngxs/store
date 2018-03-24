# LocalStorage

You can back your stores with LocalStorage by including the `NgxsLocalStoragePlugin` plugin.

```TS
import { NgxsModule, NgxsLocalStoragePluginModule, StorageStrategy } from '@ngxs/store';

@NgModule({
  imports: [
    NgxsModule.forRoot([]),
    NgxsLocalStoragePluginModule.forRoot({
      /**
       * Default key to persist. You can pass a string or array of string
       * that can be deeply nested via dot notation.
       */
      key: '@@STATE',

      /**
       * Storage strategy to use. Thie defaults to localStorage but you
       * can pass sessionStorage or anything that implements the localStorage API.
       */
      storage: localStorage,

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

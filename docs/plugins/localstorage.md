# LocalStorage

You can back your stores with LocalStorage by including the `LocalStoragePlugin` plugin.

```TS
import { NgxsModule, LocalStoragePluginModule, StorageStrategy } from 'ngxs';

@NgModule({
  imports: [
    NgxsModule.forRoot([]),
    LocalStoragePluginModule.forRoot({
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

# Storage

You can back your stores with Storage plugin by including `NgxsStoragePlugin`.

```TS
import { NgxsModule, NgxsStoragePluginModule, StorageStrategy } from '@ngxs/store';

@NgModule({
  imports: [
    NgxsModule.forRoot([]),
    NgxsStoragePluginModule.forRoot({
      /**
       * Key for the state slice to store in the storage engine.
       */
      key?: string | string[] | undefined;

      /**
       * Storage engine to use. Options are 'localStorage' or 'sessionStorage'.
       *
       * Defaults to 'localStorage' if no value is provided.
       * localStorage persists the data till it is explicitly cleared.
       * sessionStorage retains the data for the duration of the session ONLY.
       *
       * Third-party storage engines are also supported, as long as they implement
       * compatible APIs such as .getItem() and .setItem()., and that they are
       * registered globally as either localStorage or sessionStorage.
       */
      storage?: NgxStorageStrategy;

      /**
       * Serailizer for the object before its pushed into the engine.
       */
      serialize?(obj: any);

      /**
       * Deserializer for the object before its pulled out of the engine.
       */
      deserialize?(obj: any);
    })
  ]
})
export class MyModule {}
```

# Logger Plugin

NGXS comes with a logger plugin for common debugging usage. To take advantage of this
simply import it, configure it and add it to your plugins options.

```javascript
import { NgxsModule, NgxsLoggerPluginModule } from '@ngxs/store';

@NgModule({
  imports: [
    NgxsModule.forRoot([ZooStore]),
    NgxsLoggerPluginModule.forRoot({
      /**
       * Logger to implement. Defaults to console.
       */
      logger: console,

      /**
       * Collapse the log by default or not. Defaults to true.
       */
      collapsed: true
    })
  ]
})
export class MyModule {}
```

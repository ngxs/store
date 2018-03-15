# Logger Plugin

NGXS comes with a logger plugin for common debugging usage. To take advantage of this
simply import it, configure it and add it to your plugins options.

```javascript
import { NgxsModule, LoggerPluginModule } from 'ngxs';

@NgModule({
  imports: [
    NgxsModule.forRoot([ZooStore]),
    LoggerPluginModule.forRoot({
      // custom console.log implement
      logger: console,

      // expand results by default
      collapsed: false
    })
  ]
})
export class MyModule {}
```

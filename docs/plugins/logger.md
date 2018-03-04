# Logger Plugin

NGXS comes with a logger plugin for common debugging usage. To take advantage of this
simply import it, configure it and add it to your plugins options.

```javascript
import { LoggerPlugin } from 'ngxs';

@NgModule({
  imports: [
    NgxsModule.forRoot([ZooStore], {
      plugins: [
        // `forRoot` is optional if you want to pass options
        LoggerPlugin.forRoot({
          // custom console.log implement
          logger: console,

          // expand results by default
          expanded: true
        })
      ]
    })
  ]
})
export class MyModule {}
```

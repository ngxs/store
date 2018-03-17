# Redux Devtools

To enable support for the [Redux Devtools extension](http://extension.remotedev.io/),
add the following plugin to your `forRoot` configuration:

```javascript
import { NgxsModule, ReduxDevtoolsPluginModule } from 'ngxs';

@NgModule({
  imports: [
    NgxsModule.forRoot([]),
    ReduxDevtoolsPluginModule.forRoot({
      /**
       * Disable the devtools, useful to disabling during production
       */
      disabled: false
    })
  ]
})
export class MyModule {}
```

# Redux Devtools

To enable support for the [Redux Devtools extension](http://extension.remotedev.io/),
add the following plugin to your `forRoot` configuration:

```javascript
import { NgxsModule } from '@ngxs/store';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';

@NgModule({
  imports: [
    NgxsModule.forRoot([]),
    NgxsReduxDevtoolsPluginModule.forRoot({
      /**
       * Disable the devtools, useful to disabling during production
       */
      disabled: false
    })
  ]
})
export class MyModule {}
```

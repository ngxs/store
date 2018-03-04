# Redux Devtools
To enable support for the [Redux Devtools extension](http://extension.remotedev.io/),
add the following plugin to your `forRoot` configuration:

```javascript
import { NgxsModule, ReduxDevtoolsPlugin } from 'ngxs';

@NgModule({
  imports: [
    NgxsModule.forRoot([], {
      plugins: [
        // `forRoot` is optional if you want to pass options
        ReduxDevtoolsPlugin.forRoot({
          disabled: false // Set to true for prod mode
        })
      ]
    })
  ]
})
export class MyModule{}
```

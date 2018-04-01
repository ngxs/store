## Installing
To get started, install the package thru npm:

```
npm i @ngxs/store --S
```

then in `app.module.ts`, import the `NgxsModule`:

```javascript
import { NgModule } from '@angular/core';
import { NgxsModule } from '@ngxs/store';

@NgModule({
  imports: [
    NgxsModule.forRoot([
      ZooState
    ])
  ]
})
```

When you include the module in the import, you can pass root stores along with options.
If you are lazy loading, you can use the `forFeature` option with the same arguments.

Its important that you add `NgxsModule.forRoot([])` at the root of your module even if
all your states are feature states.

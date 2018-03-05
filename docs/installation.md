## Installing
To get started, install the package thru npm:

```
npm i ngxs --S
```

then in `app.module.ts`, import the `NgxsModule`:

```javascript
import { NgModule } from '@angular/core';
import { NgxsModule } from 'ngxs';

@NgModule({
  imports: [
    NgxsModule.forRoot([
      ZooStore
    ], { /* optional options */ })
  ]
})
```

When you include the module in the import, you can pass root stores along with options.
If you are lazy loading, you can use the `forFeature` option with the same arguments.

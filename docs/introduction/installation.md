## Installation
To get started, install the package from npm. The latest version (3.x) supports Angular/RX 6, if you want support for Angular5, use version 2.x.

```bash
npm install @ngxs/store --save

# or if you are using yarn
yarn add @ngxs/store
```

then in `app.module.ts`, import the `NgxsModule`:

```TS
import { NgModule } from '@angular/core';
import { NgxsModule } from '@ngxs/store';

@NgModule({
  imports: [
    NgxsModule.forRoot([
      ZooState
    ])
  ]
})
export class AppModule {}
```

When you include the module in the import, you can pass root stores along with [options](../advanced/options.md).
If you are lazy loading, you can use the `forFeature` option with the same arguments.

Options such as `developmentMode` can be passed to the module as the second argument in the `forRoot` method.
In development mode, plugin authors can add additional runtime checks/etc to enhance the developer experience. Switching
to development mode will also freeze your store using [deep-freeze-strict](https://www.npmjs.com/package/deep-freeze-strict)
module.

It's important that you add `NgxsModule.forRoot([])` at the root of your module even if
all of your states are feature states.


## Development Builds
Our continuous integration server runs all tests on every commit to master and if they pass it will publish a new development build to NPM and tag it with the @dev tag.

This means that if you want the bleeding edge of `@ngxs/store` or any of the plugins you can simply do:

```bash
npm install @ngxs/store@dev --save
npm install @ngxs/logger-plugin@dev --save

# or if you are using yarn
yarn add @ngxs/store@dev
yarn add @ngxs/logger-plugin@dev

# of if you want to update multiple things at the same time
yarn add @ngxs/{store,logger-plugin,devtools-plugin}@dev
```

This will install the version currently tagged as `@dev`.
Your package.json file will be locked to that specific version.

```json
{
  "dependencies": {
    "@ngxs/store": "3.0.0-dev.a0d076d"
  }
}
```
If you later want to again update to the bleeding edge, you will have to run the above command again.

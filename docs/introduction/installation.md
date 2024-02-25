# Installation

## Installing with schematics

You can install the `@ngxs/store` using `ng-add` schematic

```bash
ng add @ngxs/store
```

Note: This command will prompt you to choose the **plugins** you want to install and the name of the **project** you want to use NGXS with.

You have the option to enter the options yourself

```bash
ng add @ngxs/store --plugins DEVTOOLS,FORM --project angular-ngxs-project
```

| Option    | Description                                               | Default Value               |
| --------- | --------------------------------------------------------- | --------------------------- |
| --project | Name of the project as it is defined in your angular.json | Workspace's default project |
| --plugins | Comma separate the plugins as appear below                |                             |

### Plugins to optionally install using the schematics

- Ngxs developer tools plugin
- Ngxs form plugin
- Ngxs HMR plugin
- Ngxs logger plugin
- Ngxs router plugin
- Ngxs storage plugin
- Ngxs websocket plugin

You can find more information about plugins on the [plugins page](https://www.ngxs.io/plugins).

🪄 **This command will**:

- Update `package.json` dependencies with `@ngxs/store`
- Update `package.json` dependencies with the selected plugins
- Install dependencies by executing `npm install`

If your project is standalone one:

- Update the `providers` array of your selected project with `provideStore([])`

If your application is module based:

- Update the `imports` array of your `app.module.ts` with `NgxsModule.forRoot([])`

## Manual Installation

To get started, install the package from npm. The latest version (3.x) supports Angular/RxJS 6+.

```bash
npm i @ngxs/store

# or if you are using yarn
yarn add @ngxs/store

# or if you are using pnpm
pnpm i @ngxs/store
```

Then, in your `app.config.ts`, add the `provideStore` to the list of providers:

```ts
import { provideStore } from '@ngxs/store';

export const appConfig: ApplicationConfig = {
  providers: [provideStore()]
};
```

When you provide the store at the root level, you can pass root states along with [options](../concepts/store/options.md).
If you are lazy loading, you can use the `provideStates` option with the same arguments.

Options such as `developmentMode` can be passed to the module as the second argument in the `provideStore` function.
In development mode, plugin authors can add additional runtime checks/etc to enhance the developer experience. Switching
to development mode will also freeze your store using [deep-freeze-strict](https://www.npmjs.com/package/deep-freeze-strict)
module.

It's important that you add `provideStore` at the root level even if all of your states are feature states.

## Development Builds

Our continuous integration server runs all tests on every commit to master and if they pass it will publish a new development build to NPM and tag it with the @dev tag.

This means that if you want the bleeding edge of `@ngxs/store` or any of the plugins you can simply do:

```bash
npm install @ngxs/store@dev
npm install @ngxs/logger-plugin@dev
npm install @ngxs/devtools-plugin@dev

# or if you are using yarn
yarn add @ngxs/store@dev
yarn add @ngxs/logger-plugin@dev
yarn add @ngxs/devtools-plugin@dev

# of if you want to update multiple things at the same time
yarn add @ngxs/{store,logger-plugin,devtools-plugin}@dev

# or if you are using pnpm
pnpm install @ngxs/store@dev
pnpm install @ngxs/logger-plugin@dev
pnpm install @ngxs/devtools-plugin@dev
```

This will install the version currently tagged as `@dev`. Your package.json file will be locked to that specific version.

```json
{
  "dependencies": {
    "@ngxs/store": "3.0.0-dev.a0d076d"
  }
}
```

If you later want to again update to the bleeding edge, you will have to run the above command again.

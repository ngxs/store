# Announcing NGXS 3.9

NGXS v3.9 is the result of months of hard work by the team, who have been dedicated to ensuring that the library is stable and that its core features are enhanced, all while maintaining its simplicity

## Overview

- 🎨 Standalone API
- 🚀 Schematics
- 🔌 Plugin Improvements

---

## Standalone API

We have introduced a new, standalone API that is backward compatible with the old API. Here is a quick comparison of the two APIs:

_Before_

```ts=
import { NgxsModule } from '@ngxs/store';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';

@NgModule({
    imports: [
        NgxsModule.forRoot([TodosState], {
            developmentMode: !environment.production
        }),
        NgxsReduxDevtoolsPluginModule.forRoot({ disabled: environment.production })
  ],
})
export class AppModule {}
```

_After_

```ts=
import { provideStore } from '@ngxs/store';
import { withNgxsReduxDevtoolsPlugin } from '@ngxs/devtools-plugin';

export const appConfig: ApplicationConfig = {
    providers: [
        provideStore(
            [TodosState],
            { developmentMode: !environment.production },
            withNgxsReduxDevtoolsPlugin({ disabled: environment.production })
        )
    ]
};
```

The `provideStore` function is the central hub for managing your NGXS Store. This is where you register your States, configure your NGXS store, and enable any plugins that you want to use.

All NGXS plugins follow the naming convention `withNgxs{name}Plugin`. For example, the plugin for logging state changes is called `withNgxsLoggerPlugin`.

Let's explore a comprehensive list of all the plugins and how to use them using modules and the standalone API.

| Plugin     | Module                                                            | Standalone                                              |
| :--------- | :---------------------------------------------------------------- | :------------------------------------------------------ |
| DevTools   | `NgxsReduxDevtoolsPluginModule.forRoot()`                         | `withNgxsReduxDevtoolsPlugin()`                         |
| Logger     | `NgxsLoggerPluginModule.forRoot()`                                | `withNgxsLoggerPlugin()`                                |
| Storage    | `NgxsStoragePluginModule.forRoot()`                               | `withNgxsStoragePlugin()`                               |
| Forms      | `NgxsFormPluginModule.forRoot()`                                  | `withNgxsFormPlugin()`                                  |
| Router     | `NgxsRouterPluginModule.forRoot()`                                | `withNgxsRouterPlugin()`                                |
| Web Socket | `NgxsWebsocketPluginModule.forRoot({url: 'ws://localhost:4200'})` | `withNgxsWebSocketPlugin({url: 'ws://localhost:4200'})` |

## Schematics

NGXS is a popular state management library for Angular applications. It is known for its simplicity, but it can be challenging to get started with, especially for beginners.

NGXS schematics are a new feature that makes it easier to use NGXS by automating the installation, and creation of common NGXS concepts, such as Store, Actions, and State.

To auto-configure NGXS to your application, all you have to do is to execute the following command in your terminal:

```bash
ng add @ngxs/store
```

Does your workspace have multiple projects? No problem! You'll be prompted to select the project you want to add NGXS to.

NGXS plugins: We couldn't resist adding [plugins](https://www.ngxs.io/plugins) to the schematics. Now you can choose which plugins you want to use, and we'll install the necessary packages and configure them for you automatically!

> All the schematics support both non-standalone and standalone Angular apps.

Let's see some examples:

- To create a `Store` :

  ```bash
  ng generate @ngxs/store:store
  ```

  ```ts=
  import { provideStore } from '@ngxs/store';

  export const appConfig: ApplicationConfig = {
      providers: [
          provideStore(
              [],
              { developmentMode: !environment.production }
          )
      ]
  };
  ```

- To create a `State`:

  ```bash
  ng generate @ngxs/store:state --name TodosState
  ```

  ```ts=
  import { provideStore } from '@ngxs/store';
  import { TodosState } from 'your/path'

  export const appConfig: ApplicationConfig = {
      providers: [
          provideStore(
              [TodosState], // <--
              { developmentMode: !environment.production }
          )
      ]
  };
  ```

- To create `Actions`:

  ```bash
  ng generate @ngxs/store:actions --name todos
  ```

  It will create the `todos.actions.ts` file

...

## Bug Fixes

(Introduction, details and usage)

## Plugin Improvements

The plugins exposes some of its internal API implementations to allow library authors to experiment with potential extensions. However, keep in mind that these API implementations are not part of the official API, but rather an internals API. This means that they could be changed at any time in the future. Let's see some of their details:

> _Please note the `barred O` symbol which denotes it's not part of the official API_

**Router Plugin**

The exposed tokens and function are:

- `ɵNGXS_ROUTER_PLUGIN_OPTIONS`
- `ɵUSER_OPTIONS`
- `ɵcreateRouterPluginOptions`

You can import them using this path `@ngxs/router-plugin/internals` as seen below:

---

**Storage Plugin**

The exposed tokens and function are:

- `ɵDEFAULT_STATE_KEY`

  The storage plugin's key [option](https://www.ngxs.io/plugins/storage#options) allows you to specify which state slices should be persisted in storage. If you don't provide any state names, the plugin will persist all states using the `@@STATE` key. You can now use the `ɵDEFAULT_STATE_KEY` token to provide an alternative to `@@STATE`.

- `ɵFINAL_NGXS_STORAGE_PLUGIN_OPTIONS`,
- `ɵNGXS_STORAGE_PLUGIN_OPTIONS`,
- `ɵextractStringKey`,
- `ɵisKeyWithExplicitEngine`,
- `ɵcreateFinalStoragePluginOptions`

  As of today, SSR apps can use custom storage engine implementations instead of relying on `localStorage` or `sessionStorage`.
  This new internal API gives you the flexibility to further customize your storage solution.

You can import them using this path `@ngxs/storage-plugin/internals`.

...

## NGXS Labs Projects Updates

...

### New Labs Project: @ngxs-labs/...

...

### Labs Project Updates: @ngxs-labs/...

...

---

## Some Useful Links

If you would like any further information on changes in this release please feel free to have a look at our changelog. The code for NGXS is all available at https://github.com/ngxs/store and our docs are available at http://ngxs.io/. We have a thriving community on our slack channel so come and join us to keep abreast of the latest developments. Here is the slack invitation link: https://join.slack.com/t/ngxs/shared_invite/zt-by26i24h-2CC5~vqwNCiZa~RRibh60Q

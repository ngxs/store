# Module Federation

Module Federation with `webpack 5` enables angular for a seamless Microfrontend experience. Using NGXS in this context is as simple as in any other angular application. But there are some things to keep in mind.

This guide is based on `@angular/core@12.2.5` witch uses `webpack@5.50.0` and [@angular-architects/module-federation@12.4.0](https://www.npmjs.com/package/@angular-architects/module-federation).

## Sharing Dependencies

In module federation with `webpack 5`, it is possible to share dependencies between the Microfrontends. This is useful for dependencies like the angular runtime, which does not need to be reloaded and executed for each Microfrontend. For this purpose, each Microfrontend specifies which dependencies it has and is willing to share with others.

For this purpose, the dependencies are specified in the shared object in `webpack.config.js`. This also applies to NGXS libraries. It is important that `singleton: true` is specified. It is recommended to share `rxjs` as well.

> Module federation should work a LOT better with the @dev tagged version of NGXS. But it is also possible to use the latest stable version (3.7.2).

```js
plugins: [
    new ModuleFederationPlugin({

      name: "mfOne",
      filename: "remoteEntry.js",
      exposes: {
        './mfModuleX': './apps/mfOne/src/app/x/x.module.ts',
        './mfModuleY': './apps/mfOne/src/app/y/y.module.ts',
      },

      shared: share({
        "@angular/core": {singleton: true, strictVersion: true, requiredVersion: 'auto'},
        "@angular/common": {singleton: true, strictVersion: true, requiredVersion: 'auto'},
        "@angular/common/http": {singleton: true, strictVersion: true, requiredVersion: 'auto'},
        "@angular/router": {singleton: true, strictVersion: true, requiredVersion: 'auto'},
        "@ngxs/devtools-plugin": {singleton: true, strictVersion: true, requiredVersion: '3.7.2'},
        "@ngxs/store": {singleton: true, strictVersion: true, requiredVersion: '3.7.2'},
        "rxjs": {singleton: true, strictVersion: true, requiredVersion: '6.6.7'},
        
        ...sharedMappings.getDescriptors()
      })
    }),
    sharedMappings.getPlugin()
  ]
```

## Into libraries

Code, that is not shared, will be reinitiated, when a module is loaded. This is also true for angular services. In case of NGXS, this will be a problem. Every state is only allowed once and try's to register itself in the root store. If the same state comes from multiples Microfrontends, or the same Microfrontend, but with from different places will result in an error.

To solve the problem, the state can be moved to a library. This is particularly useful in applications that are developed with `nx`. These libraries can then be shared in the same way as libraries from the previous example.

```js
plugins: [
    new ModuleFederationPlugin({
      // ...
      shared: share({
        // ...
        "@project/shared/utils": {singleton: true, import: "libs/shared/utils/src/index"},
        "@project/usecase/domain": {singleton: true, import: "libs/usecase/domain/src/index"},
        // ...
```

## Stand alone

With module federation, the Microfrontends can also run on their own. For this case, an entry module is needed, which must not be exported in the `webpack.config.js`. In this module, all `.forRoot()` modules are imported, e.g. the `Router` or `NgxsModule.forRoot()`.

The standalone mode can be used for end-to-end tests. It is also a good idea to use the standalone mode for debugging.

If the application should not run in standalone mode, this is not needed.

In the article [Using Module Federation with (Nx) Monorepos and Angular](https://www.angulararchitects.io/en/aktuelles/using-module-federation-with-monorepos-and-angular/) by Manfred Steyer, from the module federation article series, it goes a bit deeper into the details of sharing libraries.

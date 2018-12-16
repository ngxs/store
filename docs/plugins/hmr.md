# Hot Module Replacement

Hot Module Replacement (HMR) is a WebPack feature to update code in a running app without rebuilding it. This results in faster updates and less full page-reloads.
In order to get HMR working with Angular CLI we first need to add a new environment and enable it.

### Add environment for HMR

In this step will configure the Angular CLI environments and define in which environment we enable HMR. 
We will start out by adding and changing files in the `src/environments/` directory. 
First we create a file called `src/environments/environment.hmr.ts` with the following contents:

```ts
export const environment = {
 production: false,
 hmr: true
};
```

Update `src/environments/environment.prod.ts` and add the hmr: false flag to the environment:

```ts
export const environment = {
 production: true,
 hmr: false
};
```

Lastly we edit `src/environments/environment.ts` and change the environment to:

```ts
export const environment = {
 production: false,
 hmr: false
};
```

Update angular.json to include an hmr environment as explained here and add configurations within build and serve to enable hmr. 
Note that <project-name> here represents the name of the project you are adding this configuration to in angular.json.

```text
  "build": {
    "configurations": {
      ...
      "hmr": {
        "fileReplacements": [
          {
            "replace": "src/environments/environment.ts",
            "with": "src/environments/environment.hmr.ts"
          }
        ]
      }
    }
  },
  ...
  "serve": {
    "configurations": {
      ...
      "hmr": {
        "hmr": true,
        "browserTarget": "<project-name>:build:hmr"
      }
    }
  }
```

Add the necessary types to src/tsconfig.app.json

```text
{
  ...
  "compilerOptions": {
    ...
    "types": ["node"]
  },
}
```

Run ng serve with the flag --configuration hmr to enable hmr and select the new environment:

```bash
ng serve --configuration hmr
```

Create a shortcut for this by updating package.json and adding an entry to the script object:

```bash
"scripts": {
  ...
  "hmr": "ng serve --configuration hmr"
}
```

### Add dependency and configure app

In order to get HMR working we need to install the dependency and configure our app to use it.

Install the `@angularclass/hmr`, `@ngxs/hmr-plugin` module as a dev-dependency

Update src/main.ts to use the file we just created:

```ts
import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { hmrNgxsBootstrap } from '@ngxs/hmr-plugin';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

const bootstrap = () => platformBrowserDynamic().bootstrapModule(AppModule);

if (environment.hmr) {
  if (module[ 'hot' ]) {
    hmrNgxsBootstrap(module, bootstrap);
  } else {
    console.error('HMR is not enabled for webpack-dev-server!');
    console.log('Are you using the --hmr flag for ng serve?');
  }
} else {
  bootstrap().catch(err => console.log(err));
}
```

### Update src/app/app.module.ts to manage the state in HMR lifecycle:

```ts
import { StateOperations } from '@ngxs/store';
import { NgxsHmrLifeCycle, NgxsStoreSnapshot } from '@ngxs/hmr-plugin';

@NgModule({ .. })
export class AppBrowserModule implements NgxsHmrLifeCycle<NgxsStoreSnapshot> {

  public hmrNgxsStoreOnInit(ctx: StateOperations<NgxsStoreSnapshot>, snapshot: NgxsStoreSnapshot) {
    console.log('[NGXS HMR] Current state', ctx.getState());
    console.log('[NGXS HMR] Previous state', snapshot);
    ctx.setState({ ...ctx.getState(), ...snapshot });
  }

  public hmrNgxsStoreBeforeOnDestroy(ctx: StateOperations<NgxsStoreSnapshot>): NgxsStoreSnapshot  {
    const snapshot: NgxsStoreSnapshot = ctx.getState();
    console.log('[NGXS HMR] Saved state before on destroy', snapshot);
    return snapshot;
  }

}
```

### Starting the development environment with HMR enabled

Now that everything is set up we can run the new configuration:

```bash
npm run hmr
```

Example:

![hmr](../assets/hmr.gif)

When starting the server Webpack will tell you that it’s enabled:

```bash
NOTICE Hot Module Replacement (HMR) is enabled for the dev server.
```

Now if you make changes to one of your components they changes should be visible automatically without a complete browser refresh.

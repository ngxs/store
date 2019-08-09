# Dynamic Plugins

Angular provides the ability to have a different environment file loaded for development as compared to production or other build targets. We can use this to improve our application bundling when it comes to development only packages. In NGXS the packages that are mainly useful only for development mode are the
`@ngxs/devtools-plugin` and `@ngxs/logger-plugin`. Typically you would only want to use these packages
during development and not in production.

Let's look at the code below:

```ts
// environment.ts
import { NgxsLoggerPluginModule } from '@ngxs/logger-plugin';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';

export const environment = {
  production: false,
  plugins: [NgxsLoggerPluginModule.forRoot(), NgxsReduxDevtoolsPluginModule.forRoot()]
};
```

This means that these plugins will be used only when Angular uses `environment.ts` file, but in
the production build it will be replaced with `environment.prod.ts` file (or any other configuration you use).
If you already figured out the `environment.prod.ts` file will contain `plugins` property that equals empty array, the code would
look as follows:

```ts
// environment.prod.ts
export const environment = {
  production: true,
  plugins: []
};
```

All we have left to do is to import the environment file and reference `plugins` property in the `AppModule` imports:

```ts
import { NgxsModule } from '@ngxs/store';

import { environment } from '../environments/environment';

@NgModule({
  imports: [
    NgxsModule.forRoot([]),
    environment.plugins
  ]
})
export class AppModule {}
```

This approach will reduce your production bundle size, as these packages are only needed during development.

# Logger Plugin

A simple console log plugin to log actions as they are processed.

## Installation

```bash
npm i @ngxs/logger-plugin

# or if you are using yarn
yarn add @ngxs/logger-plugin

# or if you are using pnpm
pnpm i @ngxs/logger-plugin
```

## Usage

When calling `provideStore`, include `withNgxsLoggerPlugin` in your app config:

```ts
import { provideStore } from '@ngxs/store';
import { withNgxsLoggerPlugin } from '@ngxs/logger-plugin';

export const appConfig: ApplicationConfig = {
  providers: [provideStore([], withNgxsLoggerPlugin())]
};
```

If you are still using modules, include the `NgxsLoggerPluginModule` plugin in your root app module:

```ts
import { NgxsModule } from '@ngxs/store';
import { NgxsLoggerPluginModule } from '@ngxs/logger-plugin';

@NgModule({
  imports: [NgxsModule.forRoot([]), NgxsLoggerPluginModule.forRoot()]
})
export class AppModule {}
```

### Options

The plugin supports the following options passed via the `forRoot` method:

- `logger`: Supply a different logger, useful for logging to backend. Defaults to `console`.
- `collapsed`: Collapse the log by default or not. Defaults to `true`.
- `disabled`: Disable the logger during production. Defaults to `false`.
- `filter`: Filter actions to be logged. Takes action and state snapshot as parameters. Default predicate returns `true` for all actions.

```ts
import { provideStore, getActionTypeFromInstance } from '@ngxs/store';
import { withNgxsLoggerPlugin } from '@ngxs/logger-plugin';

import { environment } from '../environments/environment';
import { customLogger } from './path/to/custom/logger';
import { SomeAction } from './path/to/some/action';

export const appConfig: ApplicationConfig = {
  providers: [
    provideStore(
      [],
      withNgxsLoggerPlugin({
        // Use customLogger instead of console
        logger: customLogger,
        // Do not collapse log groups
        collapsed: false,
        // Do not log in production mode
        disabled: environment.production,
        // Do not log SomeAction
        filter: action => getActionTypeFromInstance(action) !== SomeAction.type
      })
    )
  ]
};
```

Or with the module approach:

```ts
import { NgxsModule, getActionTypeFromInstance } from '@ngxs/store';
import { NgxsLoggerPluginModule } from '@ngxs/logger-plugin';

import { environment } from '../environments/environment';
import { customLogger } from './path/to/custom/logger';
import { SomeAction } from './path/to/some/action';

@NgModule({
  imports: [
    NgxsModule.forRoot([]),
    NgxsLoggerPluginModule.forRoot({
      // Use customLogger instead of console
      logger: customLogger,
      // Do not collapse log groups
      collapsed: false,
      // Do not log in production mode
      disabled: environment.production,
      // Do not log SomeAction
      filter: action => getActionTypeFromInstance(action) !== SomeAction.type
    })
  ]
})
export class AppModule {}
```

> The `filter` predicate takes state snapshot as the second parameter. This should prove useful for some edge cases. However, beware of the fact that the predicate is called for every action dispatched. You may consider using a memoized function for filters more complicated than a simple action comparison.

### Notes

You should always include the logger as the last plugin in your configuration.
For instance, if you were to include logger before a plugin like the storage
plugin, the initial state would not be reflected.

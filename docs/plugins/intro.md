# Plugins

Next let's talk about plugins. Similar to Redux's meta reducers, we have
a plugins interface that allows you to build a global plugin for your state.

All you have to do is call `withNgxsPlugin` with a plugin class. If your plugins have options associated with them, we also suggest defining an injection token.

Let's take a look at a basic example of a logger:

```ts
import { makeEnvironmentProviders, InjectionToken, Injectable, Inject } from '@angular/core';
import { withNgxsPlugin } from '@ngxs/store';
import { NgxsPlugin } from '@ngxs/store/plugins';

export const NGXS_LOGGER_PLUGIN_OPTIONS = new InjectionToken('NGXS_LOGGER_PLUGIN_OPTIONS');

@Injectable()
export class LoggerPlugin implements NgxsPlugin {
  constructor(@Inject(NGXS_LOGGER_PLUGIN_OPTIONS) private options: any) {}

  handle(state, action, next) {
    console.log('Action started!', state);
    return next(state, action).pipe(
      tap(result => {
        console.log('Action happened!', result);
      })
    );
  }
}

export function withNgxsLoggerPlugin(options?: any) {
  return makeEnvironmentProviders([
    withNgxsPlugin(LoggerPlugin),
    {
      provide: NGXS_LOGGER_PLUGIN_OPTIONS,
      useValue: options
    }
  ]);
}
```

You can also use pure functions for plugins. The above example in a pure function
would look like this:

```ts
export function logPlugin(state, action, next) {
  console.log('Action started!', state);
  return next(state, action).pipe(tap(result) => {
    console.log('Action happened!', result);
  });
}
```

NOTE: When providing a pure function make sure to use `useValue` instead of `useClass`.

To register a plugin with NGXS, add the plugin in your `provideStore` as an NGXS feature and optionally pass in the plugin options like this:

```ts
export const appConfig: ApplicationConfig = {
  providers: [provideStore([ZooState], withNgxsLoggerPlugin({}))]
};
```

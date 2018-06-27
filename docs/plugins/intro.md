# Plugins

Next let's talk about plugins. Similar to Redux's meta reducers, we have
a plugins interface that allows you to build a global plugin for your state.

All you have to do is provide a class to the `NGXS_PLUGINS` token.
If your plugins have options associated with it, we suggest defining an injection token
and then a `forRoot` method on your module.

Let's take a look at a basic example of a logger:

```TS
import { Injectable, Inject, NgModule } from '@angular/core';
import { NgxsPlugin, NGXS_PLUGINS } from '@ngxs/store';

export const NGXS_LOGGER_PLUGIN_OPTIONS = new InjectionToken('NGXS_LOGGER_PLUGIN_OPTIONS');

@Injectable()
export class LoggerPlugin implements NgxsPlugin {
  constructor(@Inject() private options: any) {}

  handle(state, action, next) {
    console.log('Action started!', state);
    return next(state, action).pipe(tap(result) => {
      console.log('Action happened!', result);
    });
  }
}

@NgModule()
export class NgxsLoggerPluginModule {
  static forRoot(config?: any): ModuleWithProviders = {
    return {
      ngModule: NgxsLoggerPluginModule,
      providers: [
        {
          provide: NGXS_PLUGINS,
          useClass: LoggerPlugin,
          multi: true  
        },
        {
          provide: NGXS_LOGGER_PLUGIN_OPTIONS,
          useValue: config
        }
      ]
    }
  }
}
```

You can also use pure functions for plugins. The above example in a pure function
would look like this:

```TS
export function logPlugin(state, action, next) {
  console.log('Action started!', state);
  return next(state, action).pipe(tap(result) => {
    console.log('Action happened!', result);
  });
}
```

NOTE: When providing a pure function make sure to use `useValue` instead of `useClass`.

To register a plugin with NGXS, import the plugin module in your module and optionally pass in the plugin options like this:

```TS
@NgModule({
  imports: [NgxsModule.forRoot([ZooStore]), NgxsLoggerPluginModule.forRoot({})]
})
export class MyModule {}
```

The method also works with `forFeature`.

# Plugins

Next let's talk about plugins. Similar to Redux's meta reducers, we have
a plugins interface that allows you to build a global plugin for your state.

All you have to do is provide a class to the NGXS_PLUGINS token.
If your plugins has options associated with it, we suggest defining an injection token 
and then a forRoot method on your module

Let's take a basic example of a logger:

```TS
import { Injectable, Inject, NgModule } from '@angular/core';
import { NgxsPlugin, NGXS_PLUGINS } from 'ngxs';

export const LOGGER_PLUGIN_OPTIONS = new InjectionToken('LOGGER_PLUGIN_OPTIONS');

@Injectable()
export class LoggerPlugin implements NgxsPlugin {
  constructor(@Inject() private options: any) {}

  handle(state, action, next) {
    console.log('Action started!', state);
    return next(state, mutation).pipe(tap(result) => {
      console.log('Action happened!', result);
    });
  }
}

@NgModule()
export class LoggerPluginModule {
  static forRoot(config?: any): ModuleWithProviders = {
    return {
      ngModule: LoggerPluginModule,
      providers: [
        {
          provide: NGXS_PLUGINS,
          useClass: LoggerPlugin,
          multi: true  
        },
        {
          provide: LOGGER_PLUGIN_OPTIONS,
          useValue: config
        }
      ]
    }
  }
}
```

You can also use pure functions for plugins, the above example in a pure function
would look like this:

```javascript
export function logPlugin(state, action, next) {
  console.log('Action started!', state);
  return next(state, mutation).pipe(tap(result) => {
    console.log('Action happened!', result);
  });
}
```

NOTE: when providing a pure function make sure to use `useValue` instead of `useClass`.

To register them with NGXS, pass them via the options parameter
in the module hookup like:

```javascript
@NgModule({
  imports: [
    NgxsModule.forRoot([ZooStore]),
    LoggerPluginModule.forRoot({})
  ]
})
export class MyModule {}
```

It also works with `forFeature`.

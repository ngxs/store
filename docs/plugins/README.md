# Plugins
Next lets talk about plugins. Similar to Redux's meta reducers, we have
a plugins interface that allows you to build a global plugin for your state. 

Lets  take a basic example of a logger:

```javascript
import { NgxsPlugin } from 'ngxs';

export class LoggerPlugin implements NgxsPlugin {
  handle(state, mutation, next) {
    console.log('Mutation started!', state);
    const result = next(state, mutation);
    console.log('Mutation happened!', result);
    return result;
  }
}
```

Our plugins can also have injectables, simply decorator it with
the `Injectable` decorator and pass it to your providers. If your plugins
has options associated with it, we suggest defining a static method called
`forRoot` similar to Angular's pattern. This would look like:

```javascript
export class LoggerPlugin implements NgxsPlugin {
  static _options;
  static forRoot(options) { this._options = options; }
  handle(state, mutation, next) {
    console.log('Custom options!', LoggerPlugin._options);
    return next(state, mutation);
  }
}
```

This pattern allows us to define options while preserving the constructor
for use with DI.

You can also use pure functions for plugins, the above example in a pure function
would look like this:

```javascript
export function logPlugin(state, mutation, next) {
  console.log('Mutation started!', state);
  const result = next(state, mutation);
  console.log('Mutation happened!', result);
  return result;
}
```

To register them with NGXS, pass them via the options parameter
in the module hookup like:

```javascript
@NgModule({
  imports: [
    NgxsModule.forRoot([ZooStore], { plugins: [LoggerPlugin] })
  ]
})
export class MyModule {}
```

It also works with `forFeature`.

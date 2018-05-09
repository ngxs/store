# Logger Plugin
A simple console log plugin to log actions as they are processed.

## Install
The Logger plugin can be installed using NPM:

```bash
npm i @ngxs/logger-plugin --S
```

## Usage
Add the `NgxsLoggerPluginModule` plugin to your root app module:

```TS
import { NgxsModule } from '@ngxs/store';
import { NgxsLoggerPluginModule } from '@ngxs/logger-plugin';

@NgModule({
  imports: [
    NgxsModule.forRoot([]),
    NgxsLoggerPluginModule.forRoot()
  ]
})
export class AppModule {}
```

### Options
The plugin supports the following options passed via the `forRoot` method:

- `logger`: Supply a different logger, useful for logging to backend. Defaults to `console`.
- `collapsed`: Collapse the log by default or not. Defaults to true.

### Notes
You should always include the logger as the last plugin in your configuration.
For instance, if you were to include logger before a plugin like the storage
plugin, the initial state would not be reflected.

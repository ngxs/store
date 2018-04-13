# Redux Devtools
Plugin with integration with the [Redux Devtools extension](http://extension.remotedev.io/).

![Devtools Screenshot](../assets/devtools.png)

## Install
Devtools is a separate install from NPM, run the following to install it:

```bash
npm i @ngxs/devtools-plugin --S
```

## Usage
Add the `NgxsReduxDevtoolsPluginModule` plugin to your root app module:

```TS
import { NgxsModule } from '@ngxs/store';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';

@NgModule({
  imports: [
    NgxsModule.forRoot([]),
    NgxsReduxDevtoolsPluginModule.forRoot()
  ]
})
export class AppModule {}
```

### Options
The plugin supports the following options passed via the `forRoot` method:

- `disabled`: Disable the devtools during production
- `maxAge`: Max number of entries to keep.
- `actionSanitizer`: Reformat actions before sending to dev tools
- `stateSanitizer`: Reformat state before sending to devtools

### Notes
You should always include the devtools as the last plugin in your configuration.
For instance, if you were to include devtools before a plugin like the storage
plugin, the initial state would not be reflected.

Since NGXS uses the action class name to determine the name of the action, in
production this can result in silly names due to compression. Typically in 
production you are turning off devtools so this is not a huge issue, but in
certain cases if you really need this issue you can always explicitly declare
a name using the static `type` property in a action definition.

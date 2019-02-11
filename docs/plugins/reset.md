# Reset Plugin

Erase the whole state tree anytime you want while keeping the state(s) you need. Reset a single state or multiple states easily back to default value(s).

## Installation

```bash
npm install @ngxs/reset-plugin --save

# or if you are using yarn
yarn add @ngxs/reset-plugin
```

## Usage

Import `NgxsResetPluginModule` into your root module like:

```TS
import { NgxsModule } from '@ngxs/store';
import { NgxsResetPluginModule } from '@ngxs/reset-plugin';

@NgModule({
  imports: [
    NgxsModule.forRoot([ /* Your states here */ ]),
    NgxsResetPluginModule.forRoot()
  ]
})
export class AppModule {}
```

### Options

The plugin supports no options. Action payloads will define how it behaves.

### Actions

The reset plugin comes with the following `actions` out of the box:

- `StateErase(payload?: StateClass | StateClasses[])` - Erases all states, but keeps given state(s)
- `StateReset(payload: StateClass | StateClasses[])` - Resets given state(s) to defaults

## Recipes

You can find possible action variations with some use cases below.

### Erase states on session end

To clear all states (on logout for example):

```TS
this.store.dispatch(new StateErase());
```

To remove all states but one: \*

```TS
this.store.dispatch(new StateErase(SessionState));
```

To remove all states but some: \*

```TS
this.store.dispatch(new StateErase([SessionState, PreferencesState]));
```

\* Keeping states while deleting others is useful especially combined with [`@ngxs/storage-plugin`](https://npmjs.com/package/@ngxs/storage-plugin)

### Reset states when needed

To reset a single state to its defaults on certain events (such as route change):

```TS
this.store.dispatch(new StateReset(SessionState));
```

To reset multiple states to their defaults (may prove useful in distributed scenarios):

```TS
this.store.dispatch(new StateReset([SessionState, PreferencesState]));
```

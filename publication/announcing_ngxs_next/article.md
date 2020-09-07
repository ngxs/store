# Announcing NGXS X.x

(Intro)

## Overview

- 🚀 Feature 1
- 🎨 Feature 2
- ...
- 🐛 Bug Fixes
- 🔌 Plugin Improvements and Fixes
- 🔬 NGXS Labs Projects Updates

---

## Feature 1

(Introduction [with problem statement], details and usage)

## Feature 2

(Introduction [with problem statement], details and usage)

...

## Bug Fixes

(Introduction, details and usage)

## Plugin Improvements

### Logger Plugin

- Feature: Action Filter in Logger Plugin [#1571](https://github.com/ngxs/store/pull/1571)

The logger plugin did not have an option to ignore specific actions. It either logged every action or, when disabled, did not log any action at all. However, you may need logging actions conditionally because of several reasons like:

- Some actions are not your focus and logging them as well makes it hard to find what you are actually working on.
- Some actions are simply fired too often and the console becomes cumbersome.
- You want to log an action only when there is a certain state.

With this version, the `forRoot` method of the `NgxsLoggerPluginModule` takes a `filter` option, which is a predicate that defines the actions to be logged. Here is a simple example:

```ts
import { NgxsModule, getActionTypeFromInstance } from '@ngxs/store';
import { NgxsLoggerPluginModule } from '@ngxs/logger-plugin';
import { SomeAction } from './path/to/some/action';

@NgModule({
  imports: [
    NgxsModule.forRoot([]),
    NgxsLoggerPluginModule.forRoot({
      filter: action => getActionTypeFromInstance(action) !== SomeAction.type
    })
  ]
})
export class AppModule {}
```

In this example, the `SomeAction` action will not be logged, because the predicate returns `false` for it. You may pass more complicated prediactes if you want and even make use of current state snapshot in your predicates:

```ts
import { NgxsModule, getActionTypeFromInstance } from '@ngxs/store';
import { NgxsLoggerPluginModule } from '@ngxs/logger-plugin';
import { SomeAction } from './path/to/some/action';

@NgModule({
  imports: [
    NgxsModule.forRoot([]),
    NgxsLoggerPluginModule.forRoot({
      filter: (action, state) =>
        getActionTypeFromInstance(action) === SomeAction.type && state.foo === 'bar'
    })
  ]
})
export class AppModule {}
```

The predicate given in this example lets you log only `SomeAction` and only when `foo` state is equal to `'bar'`. This makes it easier to pinpoint a dispatched action while debugging it.

**Important Note:** The predicate will be called for every action. This may cause performance issues in development, especially when you are planning to keep the predicate after debugging. Therefore, please consider using a memoized function for filters more complicated than a simple action comparison. You may take advantage of memoization libraries for that.

### Storage Plugin

- Feature: Serialization Interceptors in Storage Plugin [#1513](https://github.com/ngxs/store/pull/1513)

You can define your own logic before or after the state get serialized or deserialized.

- beforeSerialize: Use this option to alter the state before it gets serialized.
- afterSerialize: Use this option to alter the state after it gets deserialized. For instance, you can use it to instantiate a concrete class.

```
@NgModule({
  imports: [
    NgxsStoragePluginModule.forRoot({
      key: 'counter',
      beforeSerialize: (obj, key) => {
        if (key === 'counter') {
          return {
            count: obj.count < 10 ? obj.count : 10
          };
        }
        return obj;
      },
      afterDeserialize: (obj, key) => {
        if (key === 'counter') {
          return new CounterInfoStateModel(obj.count);
        }
        return obj;
      }
    })
  ]
})
export class AppModule {}
```

### Form Plugin

- Feature: Reset Form Action [#1604](github.com/ngxs/store/pull/1604)

You can reset the form with the `ResetForm` action.

- This action resets the form and related form state.
- The form status, dirty, values, etc. will be reset by related form values after calling this action.

Example:

```html
<form [formGroup]="form" ngxsForm="exampleState.form">
  <input formControlName="text" /> <button type="submit">Add todo</button>

  <button (click)="resetForm()">Reset Form</button>
  <button (click)="resetFormWithValue()">Reset Form With Value</button>
</form>
```

```typescript
@Component({...})
class FormExampleComponent {
  public form = new FormGroup({
    text: new FormControl(),
  });

  constructor(private store: Store) {}

  resetForm() {
    this.store.dispatch(new ResetForm({ path: 'exampleState.form' }));
  }

  resetFormWithValue() {
    this.store.dispatch(
      new ResetForm({
        path: 'exampleState.form',
        value: {
          text: 'Default Text',
        },
      }),
    );
  }
}
```

### Plugin X

- Feature A description
- Fix B description

### Plugin Y

- ...

---

## NGXS Labs Projects Updates

### New Labs Project: @ngxs-labs/...

...

### Labs Project Updates: @ngxs-labs/...

...

---

## Some Useful Links

If you would like any further information on changes in this release please feel free to have a look at our changelog. The code for NGXS is all available at https://github.com/ngxs/store and our docs are available at http://ngxs.io/. We have a thriving community on our slack channel so come and join us to keep abreast of the latest developments. Here is the slack invitation link: https://join.slack.com/t/ngxs/shared_invite/zt-by26i24h-2CC5~vqwNCiZa~RRibh60Q

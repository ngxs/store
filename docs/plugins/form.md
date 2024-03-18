# Form Plugin - Experimental Status

Often when building Reactive Forms in Angular, you need to bind values from the
store to the form and vice versa. The values from the store are observable and
the reactive form accepts raw objects, as a result we end up monkey patching
this back and forth.

In addition to these issues, there are workflows where you want
to fill out a form and leave and then come back and resume your current status.
This is an excellent use case for stores and we can conquer that case with this plugin.

In a nutshell, this plugin helps to keep your forms and state in sync.

## Installation

```bash
npm i @ngxs/form-plugin

# or if you are using yarn
yarn add @ngxs/form-plugin

# or if you are using pnpm
pnpm i @ngxs/form-plugin
```

## Usage

When calling `provideStore`, include `withNgxsFormPlugin` in your app config:

```ts
import { provideStore } from '@ngxs/store';
import { withNgxsFormPlugin } from '@ngxs/form-plugin';

import { NovelsState } from './novels.state';

export const appConfig: ApplicationConfig = {
  providers: [provideStore([NovelsState], withNgxsFormPlugin())]
};
```

If you are still using modules, include the `NgxsFormPluginModule` plugin in your root app module:

```ts
import { NgxsFormPluginModule } from '@ngxs/form-plugin';

import { NovelsState } from './novels.state';

@NgModule({
  imports: [NgxsModule.forRoot([NovelsState]), NgxsFormPluginModule.forRoot()]
})
export class AppModule {}
```

If your form is used in a standalone component, it must be imported there as well:

```ts
import { NgxsFormDirective } from '@ngxs/form-plugin';

@Component({
  ...,
  standalone: true,
  imports: [ReactiveFormsModule, NgxsFormDirective]
})
export class AppComponent {}
```

### Form State

Define your default form state as part of your application state.

```ts
import { Injectable } from '@angular/core';
import { State } from '@ngxs/store';

@State({
  name: 'novels',
  defaults: {
    newNovelForm: {
      model: undefined,
      dirty: false,
      status: '',
      errors: {}
    }
  }
})
@Injectable()
export class NovelsState {}
```

### Form Setup

In your component, you would implement the reactive form and
decorate the form with the `ngxsForm` directive with the path
of your state object. We are passing the _string_ path to `ngxsForm`.
The directive uses this path to connect itself to the store and setup bindings.

```ts
import { Component } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { NgxsFormDirective } from '@ngxs/form-plugin';

@Component({
  selector: 'new-novel-form',
  template: `
    <form [formGroup]="newNovelForm" ngxsForm="novels.newNovelForm" (ngSubmit)="onSubmit()">
      <input type="text" formControlName="novelName" />
      <button type="submit">Create</button>
    </form>
  `,
  standalone: true,
  imports: [ReactiveFormsModule, NgxsFormDirective]
})
export class NewNovelComponent {
  newNovelForm = new FormGroup({
    novelName: new FormControl()
  });

  onSubmit() {
    //
  }
}
```

Now anytime your form updates, your state will also reflect the new state.

The directive also has two inputs you can utilize as well:

- `ngxsFormDebounce: number | string` - Debounce the value changes from the form. Default value: `100`. Ignored if:
  - the provided value is less than `0` (for instance, `ngxsFormDebounce="-1"` is valid)
  - `updateOn` is `blur` or `submit`
- `ngxsFormClearOnDestroy: boolean` - Clear the state on destroy of the form.

### Actions

In addition to it automatically keeping track of the form, you can also
manually dispatch actions for things like resetting the form state. For example:

```ts
this.store.dispatch(
  new UpdateFormDirty({
    dirty: false,
    path: 'novels.newNovelForm'
  })
);
```

The form plugin comes with the following `actions` out of the box:

- `UpdateFormStatus({ status, path })` - Update the form status
- `UpdateFormValue({ value, path, propertyPath? })` - Update the form value (or optionally an inner property value)
- `UpdateFormDirty({ dirty, path })` - Update the form dirty status
- `SetFormDisabled(path)` - Set the form to disabled
- `SetFormEnabled(path)` - Set the form to enabled
- `SetFormDirty(path)` - Set the form to dirty (shortcut for `UpdateFormDirty`)
- `SetFormPristine(path)` - Set the form to pristine (shortcut for `UpdateFormDirty`)
- `ResetForm({ path, value? })` - Reset the form with or without the form value.

### Updating Specific Form Properties

The form plugin exposes the `UpdateFormValue` action that provides the ability to update nested form properties by supplying a `propertyPath` parameter.

```ts
interface NovelsStateModel {
  newNovelForm: {
    model?: {
      novelName: string;
      authors: {
        name: string;
      }[];
    };
  };
}

@State<NovelsStateModel>({
  name: 'novels',
  defaults: {
    newNovelForm: {
      model: undefined
    }
  }
})
@Injectable()
export class NovelsState {}
```

The state contains information about the new novel name and its authors. Let's create a component that will render the reactive form with bounded `ngxsForm` directive:

```ts
import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NgxsFormDirective } from '@ngxs/form-plugin';

@Component({
  selector: 'new-novel-form',
  template: `
    <form [formGroup]="newNovelForm" ngxsForm="novels.newNovelForm" (ngSubmit)="onSubmit()">
      <input type="text" formControlName="novelName" />

      @for (author of newNovelForm.get('authors').value; let index = $index; track author) {
        <div formArrayName="authors">
          <div [formGroupName]="index">
            <input formControlName="name" />
          </div>
        </div>
      }

      <button type="submit">Create</button>
    </form>
  `,
  standalone: true,
  imports: [ReactiveFormsModule, NgxsFormDirective]
})
export class NewNovelComponent {
  newNovelForm = this.fb.group({
    novelName: 'Zenith',
    authors: this.fb.array([
      this.fb.group({
        name: 'Sasha Alsberg'
      })
    ])
  });

  constructor(private fb: FormBuilder) {}

  onSubmit() {
    //
  }
}
```

Let's look at the component above again. Assume we want to update the name of the first author in our form, from anywhere in our application. The code would look as follows:

```ts
store.dispatch(
  new UpdateFormValue({
    path: 'novels.newNovelForm',
    value: {
      name: 'Lindsay Cummings'
    },
    propertyPath: 'authors.0'
  })
);
```

### Debouncing

The `ngxsFormDebounce` is used alongside `debounceTime` and pipes form's `valueChanges` and `statusChanges`. This implies that state updates are asynchronous by default. Suppose you dispatch the `UpdateFormValue`, which should patch the form value. In that case, you won't get the updated state immediately because the `debounceTime` is set to `100` by default. Given the following example:

```ts
interface NovelsStateModel {
  newNovelForm: {
    model?: {
      novelName: string;
      paperBound: boolean;
    };
  };
}

export class NovelsState {
  @Action(SubmitNovelsForm)
  submitNovelsForm(ctx: StateContext<NovelsStateModel>) {
    console.log(ctx.getState().newNovelForm.model);

    ctx.dispatch(
      new UpdateFormValue({
        value: { paperBound: true },
        path: 'novels.newNovelForm'
      })
    );

    console.log(ctx.getState().newNovelForm.model);
  }
}
```

You may expect to see `{ paperBound: true, novelName: null }` being logged. Still, the second `console.log` will log `{ paperBound: true }`, pretending the `novelName` value is lost. You'll see the final update state if you wrap the second `console.log` into a `setTimeout`:

```ts
ctx.dispatch(
  new UpdateFormValue({
    value: { paperBound: true },
    path: 'novels.newNovelForm'
  })
);

setTimeout(() => {
  console.log(ctx.getState().newNovelForm.model);
}, 100);
```

If you need to get state updates synchronously, you may want to set the `ngxsFormDebounce` to `-1`; this won't pipe value changes with `debounceTime`.

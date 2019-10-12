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
npm install @ngxs/form-plugin --save

# or if you are using yarn
yarn add @ngxs/form-plugin
```

## Usage

In the root module of your application, import `NgxsFormPluginModule`
and include it in the imports.

```TS
import { NgxsFormPluginModule } from '@ngxs/form-plugin';
import { NovelsState } from './novels.state';

@NgModule({
  imports: [
    NgxsModule.forRoot([NovelsState]),
    NgxsFormPluginModule.forRoot(),
  ]
})
export class AppModule {}
```

If your form is used in a submodule, it must be imported there as well:

```TS
import { NgxsFormPluginModule } from '@ngxs/form-plugin';

@NgModule({
  imports: [
    NgxsFormPluginModule,
  ]
})
export class SomeModule {}
```

### Form State

Define your default form state as part of your application state.

```TS
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
export class NovelsState {}
```

### Form Setup

In your component, you would implement the reactive form and
decorate the form with the `ngxsForm` directive with the path
of your state object. We are passing the _string_ path to `ngxsForm`.
The directive uses this path to connect itself to the store and setup bindings.

```TS
import { Component } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'new-novel-form',
  template: `
    <form [formGroup]="newNovelForm" ngxsForm="novels.newNovelForm" (ngSubmit)="onSubmit()">
      <input type="text" formControlName="novelName">
      <button type="submit">Create</button>
    </form>
  `
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

- `ngxsFormDebounce: number` - Debounce the value changes to the form. Default value: `100`. Ignored if `updateOn` is `blur` or `submit`.
- `ngxsFormClearOnDestroy: boolean` - Clear the state on destroy of the form.

### Actions

In addition to it automatically keeping track of the form, you can also
manually dispatch actions for things like resetting the form state. For example:

```TS
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
export class NovelsState {}
```

The state contains information about the new novel name and its authors. Let's create a component that will render the reactive form with bounded `ngxsForm` directive:

```ts
@Component({
  selector: 'new-novel-form',
  template: `
    <form [formGroup]="newNovelForm" ngxsForm="novels.newNovelForm" (ngSubmit)="onSubmit()">
      <input type="text" formControlName="novelName" />

      <div
        formArrayName="authors"
        *ngFor="let author of newNovelForm.get('authors').controls; index as index"
      >
        <div [formGroupName]="index">
          <input formControlName="name" />
        </div>
      </div>

      <button type="submit">Create</button>
    </form>
  `
})
export class NewNovelComponent {
  newNovelForm = new FormGroup({
    novelName: new FormControl('Zenith'),
    authors: new FormArray([
      new FormGroup({
        name: new FormControl('Sasha Alsberg')
      })
    ])
  });

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

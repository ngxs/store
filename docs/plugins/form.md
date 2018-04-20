# Form Plugin - Experimental Status
Often when building Reactive Forms in Angular, you need to bind values from the
store to the form and vice versa. The values from the store are observable and
the reactive form accepts raw objects, as a result we end up monkey patching
this back and forth. 

In addition to these issues, there are workflows where you want
to fill out a form and leave and then come back and resume your current status.
This is an excellent use case for stores and we can conquer that case with this plugin.

In a nutshell, this plugin helps to keep your forms and state in sync.

## Install
The Forms plugin can be installed using NPM:

```bash
npm i @ngxs/form-plugin --S
```

## Usage
In the root module of your application, import `NgxsFormPluginModule`
and include it in the imports. 

```TS
import { NgxsFormPluginModule } from '@ngxs/form-plugin';

@NgModule({
  imports: [
    NgxsModule.forRoot(states),
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
@State({
  name: "todos",
  defaults: {
    pizzaForm: {
      model: undefined,
      dirty: false,
      status: "",
      errors: {}
    }
  }
})
export class TodosState {}
```

### Form Setup
In your component, you would implement the reactive form and
decorate the form with the `ngxsForm` directive with the path
of your state object. We are passing the _string_ path to `ngxsForm`.
The directive uses this path to connect itself to the store and setup bindings.

```TS
@Component({
  template: `
    <form [formGroup]="pizzaForm" novalidate (ngSubmit)="onSubmit()" ngxsForm="todos.pizzaForm">
      <input type="text" formControlName="toppings" />
      <button type="submit">Order</button>
    </form>
  `
})
export class PizzaComponent {
  pizzaForm = this.formBuilder.group({
    toppings: ['']
  });
}
```

Now anytime your form updates, your state will also reflect the new state.

The directive also has two inputs you can utilize as well:

- `ngxsFormDebounce: number` - Debounce the value changes to the form. Default value: `100`.
- `ngxsFormClearOnDestroy: boolean` - Clear the state on destroy of the form.

### Actions
In addition to it automatically keeping track of the form, you can also
manually dispatch actions for things like resetting the form state. For example:

```TS
this.store.dispatch(
  new UpdateFormDirty({
    dirty: false,
    path: 'todos.pizzaForm'
  })
);
```

The form plugin comes with the following `actions` out of the box:
- `UpdateFormStatus({ status, path })` - Update the form status
- `UpdateFormValue({ value, path })` - Update the form value
- `UpdateFormDirty({ dirty, path })` - Update the form dirty status
- `SetFormDisabled(path)` - Set the form to disabled
- `SetFormEnabled(path)` - Set the form to enabled
- `SetFormDirty(path)` - Set the form to dirty (shortcut for `UpdateFormDirty`)
- `SetFormPristine(path)` - Set the form to pristine (shortcut for `UpdateFormDirty`)

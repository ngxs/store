import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { By } from '@angular/platform-browser';

import { NgxsModule, State, Store, Actions, ofActionDispatched } from '@ngxs/store';

import {
  NgxsFormPluginModule,
  UpdateForm,
  UpdateFormDirty,
  UpdateFormErrors,
  UpdateFormStatus,
  UpdateFormValue,
  SetFormDirty,
  SetFormDisabled,
  SetFormEnabled,
  SetFormPristine
} from '../';

describe('NgxsFormPlugin', () => {
  interface StateModel {
    studentForm: Form;
  }

  interface Form {
    model: any;
    errors?: { [k: string]: string };
    dirty?: boolean;
    disabled?: boolean;
    status?: string;
  }

  @State<StateModel>({
    name: 'actions',
    defaults: {
      studentForm: { model: undefined }
    }
  })
  class MyStore {}

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([MyStore]), NgxsFormPluginModule.forRoot()]
    });
  });

  it('should set form dirty', () => {
    const store: Store = TestBed.get(Store);
    store.dispatch(new SetFormDirty('actions.studentForm'));

    store
      .select((state: any) => state.actions.studentForm)
      .subscribe((form: Form) => {
        expect(form.dirty).toBe(true);
      });
  });

  it('should set form pristine', () => {
    const store: Store = TestBed.get(Store);
    // first set dirty, then pristine
    store.dispatch(new SetFormDirty('actions.studentForm'));
    store.dispatch(new SetFormPristine('actions.studentForm'));

    store
      .select((state: any) => state.actions.studentForm)
      .subscribe((form: Form) => {
        expect(form.dirty).toBe(false);
      });
  });

  it('should set form disabled', () => {
    const store: Store = TestBed.get(Store);
    store.dispatch(new SetFormDisabled('actions.studentForm'));

    store
      .select((state: any) => state.actions.studentForm)
      .subscribe((form: Form) => {
        expect(form.disabled).toBe(true);
      });
  });

  it('should set form enabled', () => {
    const store: Store = TestBed.get(Store);
    // first set disabled, then enabled.
    store.dispatch(new SetFormDisabled('actions.studentForm'));
    store.dispatch(new SetFormEnabled('actions.studentForm'));

    store
      .select((state: any) => state.actions.studentForm)
      .subscribe((form: Form) => {
        expect(form.disabled).toBe(false);
      });
  });

  it('should update form dirty', () => {
    const store: Store = TestBed.get(Store);
    store.dispatch(new UpdateFormDirty({ path: 'actions.studentForm', dirty: true }));

    store
      .select((state: any) => state.actions.studentForm)
      .subscribe((form: Form) => {
        expect(form.dirty).toBe(true);
      });
  });

  it('should update form status', () => {
    const store: Store = TestBed.get(Store);
    store.dispatch(new UpdateFormStatus({ path: 'actions.studentForm', status: 'VALID' }));

    store
      .select((state: any) => state.actions.studentForm)
      .subscribe((form: Form) => {
        expect(form.status).toBe('VALID');
      });
  });

  it('should update form errors', () => {
    const store: Store = TestBed.get(Store);
    store.dispatch(
      new UpdateFormErrors({
        errors: { address: 'address is too long', name: 'empty not allowed' },
        path: 'actions.studentForm'
      })
    );

    store
      .select((state: any) => state.actions.studentForm)
      .subscribe((form: Form) => {
        expect(form.errors!.name).toBe('empty not allowed');
        expect(form.errors!.address).toBe('address is too long');
      });
  });

  it('should update form value', () => {
    const store: Store = TestBed.get(Store);
    store.dispatch(
      new UpdateFormValue({
        value: { address: 'waterloo, ontario', name: 'Lou Grant' },
        path: 'actions.studentForm'
      })
    );

    store
      .select((state: any) => state.actions.studentForm)
      .subscribe((form: Form) => {
        expect(form.model.name).toBe('Lou Grant');
        expect(form.model.address).toBe('waterloo, ontario');
      });
  });

  it('should update form array value', () => {
    const store = TestBed.get(Store);
    store.dispatch(
      new UpdateFormValue({
        value: ['waterloo, ontario', 'Lou Grant'],
        path: 'actions.studentForm'
      })
    );

    store
      .select((state: any) => state.actions.studentForm)
      .subscribe((form: Form) => {
        expect(Array.isArray(form.model)).toBeTruthy();
        expect(form.model).toEqual(['waterloo, ontario', 'Lou Grant']);
      });
  });

  it('should update form', () => {
    const store: Store = TestBed.get(Store);
    store.dispatch(
      new UpdateForm({
        value: { address: 'waterloo, ontario', name: 'Lou Grant' },
        errors: { address: 'address is too long', name: 'empty not allowed' },
        dirty: true,
        status: 'INVALID',
        path: 'actions.studentForm'
      })
    );

    store
      .select((state: any) => state.actions.studentForm)
      .subscribe((form: Form) => {
        expect(form.status).toBe('INVALID');
        expect(form.dirty).toBe(true);
        expect(form.errors!.name).toBe('empty not allowed');
        expect(form.errors!.address).toBe('address is too long');
        expect(form.model.name).toBe('Lou Grant');
        expect(form.model.address).toBe('waterloo, ontario');
      });
  });

  describe('NgxsFormPlugin runtime behavior', () => {
    it('should sync model with form', () => {
      @State({
        name: 'todos',
        defaults: {
          todosForm: {
            model: {
              text: 'Buy some coffee'
            },
            dirty: true
          }
        }
      })
      class TodosState {}

      @Component({
        template: `
          <form [formGroup]="form" ngxsForm="todos.todosForm">
            <input formControlName="text" /> <button type="submit">Add todo</button>
          </form>
        `
      })
      class MockComponent {
        public form = new FormGroup({
          text: new FormControl()
        });
      }

      TestBed.configureTestingModule({
        imports: [
          ReactiveFormsModule,
          NgxsModule.forRoot([TodosState]),
          NgxsFormPluginModule.forRoot()
        ],
        declarations: [MockComponent]
      });

      const fixture = TestBed.createComponent(MockComponent);

      fixture.detectChanges();

      const input = fixture.debugElement.query(By.css('form input')).nativeElement;
      expect(fixture.componentInstance.form.dirty).toBe(true);
      expect(input.value).toBe('Buy some coffee');
    });

    it('should update the state if "ngxsFormClearOnDestroy" option is provided', () => {
      @State({
        name: 'todos',
        defaults: {
          todosForm: {
            model: undefined,
            dirty: false,
            status: '',
            errors: {}
          }
        }
      })
      class TodosState {}

      @Component({
        template: `
          <form [formGroup]="form" ngxsForm="todos.todosForm" [ngxsFormClearOnDestroy]="true">
            <input formControlName="text" /> <button type="submit">Add todo</button>
          </form>
        `
      })
      class MockComponent {
        public form = new FormGroup({
          text: new FormControl()
        });
      }

      TestBed.configureTestingModule({
        imports: [
          ReactiveFormsModule,
          NgxsModule.forRoot([TodosState]),
          NgxsFormPluginModule.forRoot()
        ],
        declarations: [MockComponent]
      });

      const store: Store = TestBed.get(Store);
      const fixture = TestBed.createComponent(MockComponent);

      expect(store.selectSnapshot(({ todos }) => todos).todosForm).toEqual({
        model: undefined,
        dirty: false,
        status: '',
        errors: {}
      });

      fixture.detectChanges();
      fixture.destroy();

      expect(store.selectSnapshot(({ todos }) => todos).todosForm).toEqual({
        model: {},
        dirty: null,
        status: null,
        errors: {}
      });
    });

    it('should update the state asynchronously when ngxsFormDebounce is greater or equal to zero', done => {
      @State({
        name: 'todos',
        defaults: {
          todosForm: {
            model: undefined,
            dirty: false,
            status: '',
            errors: {}
          }
        }
      })
      class TodosState {}

      @Component({
        template: `
          <form [formGroup]="form" ngxsForm="todos.todosForm" [ngxsFormDebounce]="0">
            <input formControlName="text" /> <button type="submit">Add todo</button>
          </form>
        `
      })
      class MockComponent {
        public form = new FormGroup({
          text: new FormControl()
        });
      }

      TestBed.configureTestingModule({
        imports: [
          ReactiveFormsModule,
          NgxsModule.forRoot([TodosState]),
          NgxsFormPluginModule.forRoot()
        ],
        declarations: [MockComponent]
      });

      const store: Store = TestBed.get(Store);
      const fixture = TestBed.createComponent(MockComponent);
      fixture.detectChanges();

      expect(store.selectSnapshot(({ todos }) => todos).todosForm).toEqual({
        model: { text: null },
        dirty: false,
        status: 'VALID',
        errors: {}
      });

      fixture.componentInstance.form.controls['text'].setValue('Buy some coffee');

      expect(store.selectSnapshot(({ todos }) => todos).todosForm).toEqual({
        model: { text: null },
        dirty: false,
        status: 'VALID',
        errors: {}
      });

      setTimeout(function() {
        expect(store.selectSnapshot(({ todos }) => todos).todosForm).toEqual({
          model: { text: 'Buy some coffee' },
          dirty: false,
          status: 'VALID',
          errors: {}
        });

        done();
      }, 1);
    });

    it('should update the state synchronously when ngxsFormDebounce is less than zero', () => {
      @State({
        name: 'todos',
        defaults: {
          todosForm: {
            model: undefined,
            dirty: false,
            status: '',
            errors: {}
          }
        }
      })
      class TodosState {}

      @Component({
        template: `
          <form [formGroup]="form" ngxsForm="todos.todosForm" [ngxsFormDebounce]="-1">
            <input formControlName="text" /> <button type="submit">Add todo</button>
          </form>
        `
      })
      class MockComponent {
        public form = new FormGroup({
          text: new FormControl()
        });
      }

      TestBed.configureTestingModule({
        imports: [
          ReactiveFormsModule,
          NgxsModule.forRoot([TodosState]),
          NgxsFormPluginModule.forRoot()
        ],
        declarations: [MockComponent]
      });

      const store: Store = TestBed.get(Store);
      const fixture = TestBed.createComponent(MockComponent);
      fixture.detectChanges();

      expect(store.selectSnapshot(({ todos }) => todos).todosForm).toEqual({
        model: { text: null },
        dirty: false,
        status: 'VALID',
        errors: {}
      });

      fixture.componentInstance.form.controls['text'].setValue('Buy some coffee');

      expect(store.selectSnapshot(({ todos }) => todos).todosForm).toEqual({
        model: { text: 'Buy some coffee' },
        dirty: false,
        status: 'VALID',
        errors: {}
      });
    });

    it('should update the state synchronously when form\'s updateOn is "blur"', () => {
      @State({
        name: 'todos',
        defaults: {
          todosForm: {
            model: undefined,
            dirty: false,
            status: '',
            errors: {}
          }
        }
      })
      class TodosState {}

      @Component({
        template: `
          <form [formGroup]="form" ngxsForm="todos.todosForm">
            <input formControlName="text" /> <button type="submit">Add todo</button>
          </form>
        `
      })
      class MockComponent {
        public form = new FormGroup(
          {
            text: new FormControl()
          },
          { updateOn: 'blur' }
        );
      }

      TestBed.configureTestingModule({
        imports: [
          ReactiveFormsModule,
          NgxsModule.forRoot([TodosState]),
          NgxsFormPluginModule.forRoot()
        ],
        declarations: [MockComponent]
      });

      const store: Store = TestBed.get(Store);
      const fixture = TestBed.createComponent(MockComponent);
      fixture.detectChanges();

      expect(store.selectSnapshot(({ todos }) => todos).todosForm).toEqual({
        model: { text: null },
        dirty: false,
        status: 'VALID',
        errors: {}
      });

      fixture.componentInstance.form.controls['text'].setValue('Buy some coffee');

      expect(store.selectSnapshot(({ todos }) => todos).todosForm).toEqual({
        model: { text: 'Buy some coffee' },
        dirty: false,
        status: 'VALID',
        errors: {}
      });
    });

    it('should update the state synchronously when form\'s updateOn is "submit"', () => {
      @State({
        name: 'todos',
        defaults: {
          todosForm: {
            model: undefined,
            dirty: false,
            status: '',
            errors: {}
          }
        }
      })
      class TodosState {}

      @Component({
        template: `
          <form [formGroup]="form" ngxsForm="todos.todosForm">
            <input formControlName="text" /> <button type="submit">Add todo</button>
          </form>
        `
      })
      class MockComponent {
        public form = new FormGroup(
          {
            text: new FormControl()
          },
          { updateOn: 'submit' }
        );
      }

      TestBed.configureTestingModule({
        imports: [
          ReactiveFormsModule,
          NgxsModule.forRoot([TodosState]),
          NgxsFormPluginModule.forRoot()
        ],
        declarations: [MockComponent]
      });

      const store: Store = TestBed.get(Store);
      const fixture = TestBed.createComponent(MockComponent);
      fixture.detectChanges();

      expect(store.selectSnapshot(({ todos }) => todos).todosForm).toEqual({
        model: { text: null },
        dirty: false,
        status: 'VALID',
        errors: {}
      });

      fixture.componentInstance.form.controls['text'].setValue('Buy some coffee');

      expect(store.selectSnapshot(({ todos }) => todos).todosForm).toEqual({
        model: { text: 'Buy some coffee' },
        dirty: false,
        status: 'VALID',
        errors: {}
      });
    });

    it('should not dispatch UpdateFormStatus every time as "statusChanges" emits', () => {
      @State({
        name: 'todos',
        defaults: {
          todosForm: {
            model: undefined
          }
        }
      })
      class TodosState {}

      @Component({
        template: `
          <form [formGroup]="form" ngxsForm="todos.todosForm" [ngxsFormDebounce]="-1">
            <input formControlName="text" /> <button type="submit">Add todo</button>
          </form>
        `
      })
      class MockComponent {
        public form = new FormGroup({
          text: new FormControl(null, [Validators.minLength(6)])
        });
      }

      TestBed.configureTestingModule({
        imports: [
          ReactiveFormsModule,
          NgxsModule.forRoot([TodosState]),
          NgxsFormPluginModule.forRoot()
        ],
        declarations: [MockComponent]
      });

      const actions$: Actions = TestBed.get(Actions);
      const fixture = TestBed.createComponent(MockComponent);
      fixture.detectChanges();

      const statuses: string[] = [];

      const subscription = actions$
        .pipe(ofActionDispatched(UpdateFormStatus))
        .subscribe((action: UpdateFormStatus) => {
          statuses.push(action.payload.status!);
        });

      const input = fixture.debugElement.query(By.css('form input'));

      input.nativeElement.value = 'buy';
      input.nativeElement.dispatchEvent(new KeyboardEvent('input'));
      fixture.detectChanges();

      input.nativeElement.value = 'coffee';
      input.nativeElement.dispatchEvent(new KeyboardEvent('input'));
      fixture.detectChanges();

      input.nativeElement.value = 'buy coffee';
      input.nativeElement.dispatchEvent(new KeyboardEvent('input'));
      fixture.detectChanges();

      subscription.unsubscribe();

      // Assert
      expect(statuses).toEqual(['INVALID', 'VALID']);
    });
  });
});

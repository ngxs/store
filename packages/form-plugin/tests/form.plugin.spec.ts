import { Component } from '@angular/core';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { By } from '@angular/platform-browser';

import { NgxsModule, State, Store, Actions, ofActionDispatched, Selector } from '@ngxs/store';

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
  interface StudentStateModel {
    studentForm: Form;
  }

  interface Form {
    model: any;
    errors?: { [k: string]: string };
    dirty?: boolean;
    disabled?: boolean;
    status?: string;
  }

  @State<StudentStateModel>({
    name: 'student',
    defaults: {
      studentForm: {
        model: undefined
      }
    }
  })
  class StudentState {
    @Selector()
    static getStudentForm(state: StudentStateModel): Form {
      return state.studentForm;
    }
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([StudentState]), NgxsFormPluginModule.forRoot()]
    });
  });

  const getStore = (): Store => TestBed.get(Store);

  it('should set form dirty', () => {
    // Arrange & act
    const store = getStore();
    store.dispatch(new SetFormDirty('student.studentForm'));

    const form = store.selectSnapshot(StudentState.getStudentForm);

    // Assert
    expect(form.dirty).toEqual(true);
  });

  it('should set form pristine', () => {
    // Arrange & act
    const store = getStore();
    store.dispatch(new SetFormDirty('student.studentForm'));
    store.dispatch(new SetFormPristine('student.studentForm'));

    const form = store.selectSnapshot(StudentState.getStudentForm);

    // Assert
    expect(form.dirty).toEqual(false);
  });

  it('should set form disabled', () => {
    // Arrange & act
    const store = getStore();
    store.dispatch(new SetFormDisabled('student.studentForm'));

    const form = store.selectSnapshot(StudentState.getStudentForm);

    // Assert
    expect(form.disabled).toEqual(true);
  });

  it('should set form enabled', () => {
    // Arrange & act
    const store = getStore();
    store.dispatch(new SetFormDisabled('student.studentForm'));
    store.dispatch(new SetFormEnabled('student.studentForm'));

    const form = store.selectSnapshot(StudentState.getStudentForm);

    // Assert
    expect(form.disabled).toEqual(false);
  });

  it('should update form dirty', () => {
    // Arrange & act
    const store = getStore();
    store.dispatch(
      new UpdateFormDirty({
        path: 'student.studentForm',
        dirty: true
      })
    );

    const form = store.selectSnapshot(StudentState.getStudentForm);

    // Assert
    expect(form.dirty).toEqual(true);
  });

  it('should update form status', () => {
    // Arrange & act
    const store = getStore();
    store.dispatch(
      new UpdateFormStatus({
        path: 'student.studentForm',
        status: 'VALID'
      })
    );

    const form = store.selectSnapshot(StudentState.getStudentForm);

    // Assert
    expect(form.status).toEqual('VALID');
  });

  it('should update form errors', () => {
    // Arrange & act
    const store = getStore();
    store.dispatch(
      new UpdateFormErrors({
        errors: { address: 'address is too long', name: 'empty not allowed' },
        path: 'student.studentForm'
      })
    );

    const form = store.selectSnapshot(StudentState.getStudentForm);

    // Assert
    expect(form.errors!.name).toEqual('empty not allowed');
    expect(form.errors!.address).toEqual('address is too long');
  });

  it('should update form value', () => {
    // Arrange & act
    const store = getStore();
    store.dispatch(
      new UpdateFormValue({
        value: { address: 'waterloo, ontario', name: 'Lou Grant' },
        path: 'student.studentForm'
      })
    );

    const form = store.selectSnapshot(StudentState.getStudentForm);

    // Assert
    expect(form.model.name).toEqual('Lou Grant');
    expect(form.model.address).toEqual('waterloo, ontario');
  });

  it('should update form array value', () => {
    // Arrange & act
    const store = getStore();
    store.dispatch(
      new UpdateFormValue({
        value: ['waterloo, ontario', 'Lou Grant'],
        path: 'student.studentForm'
      })
    );

    const form = store.selectSnapshot(StudentState.getStudentForm);

    // Assert
    expect(Array.isArray(form.model)).toEqual(true);
    expect(form.model).toEqual(['waterloo, ontario', 'Lou Grant']);
  });

  it('should update form', () => {
    // Arrange & act
    const store = getStore();
    store.dispatch(
      new UpdateForm({
        value: { address: 'waterloo, ontario', name: 'Lou Grant' },
        errors: { address: 'address is too long', name: 'empty not allowed' },
        dirty: true,
        status: 'INVALID',
        path: 'student.studentForm'
      })
    );

    const form = store.selectSnapshot(StudentState.getStudentForm);

    // Assert
    expect(form.status).toEqual('INVALID');
    expect(form.dirty).toEqual(true);
    expect(form.errors!.name).toEqual('empty not allowed');
    expect(form.errors!.address).toEqual('address is too long');
    expect(form.model.name).toEqual('Lou Grant');
    expect(form.model.address).toEqual('waterloo, ontario');
  });

  describe('NgxsFormPlugin runtime behavior', () => {
    it('should sync model with form', () => {
      // Arrange
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

      // Act
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

      // Assert
      expect(fixture.componentInstance.form.dirty).toBe(true);
      expect(input.value).toBe('Buy some coffee');
    });

    it('should update the state if "ngxsFormClearOnDestroy" option is provided', () => {
      // Arrange
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

      // Act
      TestBed.configureTestingModule({
        imports: [
          ReactiveFormsModule,
          NgxsModule.forRoot([TodosState]),
          NgxsFormPluginModule.forRoot()
        ],
        declarations: [MockComponent]
      });

      const store = getStore();
      const fixture = TestBed.createComponent(MockComponent);

      // Assert
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

    it('should update the state asynchronously when ngxsFormDebounce is greater or equal to zero', fakeAsync(() => {
      // Arrange
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

      // Act
      TestBed.configureTestingModule({
        imports: [
          ReactiveFormsModule,
          NgxsModule.forRoot([TodosState]),
          NgxsFormPluginModule.forRoot()
        ],
        declarations: [MockComponent]
      });

      const store = getStore();
      const fixture = TestBed.createComponent(MockComponent);
      fixture.detectChanges();

      // Assert
      expect(store.selectSnapshot(({ todos }) => todos).todosForm).toEqual({
        model: { text: null },
        dirty: false,
        status: 'VALID',
        errors: {}
      });

      fixture.componentInstance.form.controls.text.setValue('Buy some coffee');

      expect(store.selectSnapshot(({ todos }) => todos).todosForm).toEqual({
        model: { text: null },
        dirty: false,
        status: 'VALID',
        errors: {}
      });

      tick(0);

      expect(store.selectSnapshot(({ todos }) => todos).todosForm).toEqual({
        model: { text: 'Buy some coffee' },
        dirty: false,
        status: 'VALID',
        errors: {}
      });
    }));

    it('should update the state synchronously when ngxsFormDebounce is less than zero', () => {
      // Arrange
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

      // Act
      TestBed.configureTestingModule({
        imports: [
          ReactiveFormsModule,
          NgxsModule.forRoot([TodosState]),
          NgxsFormPluginModule.forRoot()
        ],
        declarations: [MockComponent]
      });

      const store = getStore();
      const fixture = TestBed.createComponent(MockComponent);
      fixture.detectChanges();

      // Assert
      expect(store.selectSnapshot(({ todos }) => todos).todosForm).toEqual({
        model: { text: null },
        dirty: false,
        status: 'VALID',
        errors: {}
      });

      fixture.componentInstance.form.controls.text.setValue('Buy some coffee');

      expect(store.selectSnapshot(({ todos }) => todos).todosForm).toEqual({
        model: { text: 'Buy some coffee' },
        dirty: false,
        status: 'VALID',
        errors: {}
      });
    });

    it('should update the state synchronously when form\'s updateOn is "blur"', () => {
      // Arrange
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

      // Act
      TestBed.configureTestingModule({
        imports: [
          ReactiveFormsModule,
          NgxsModule.forRoot([TodosState]),
          NgxsFormPluginModule.forRoot()
        ],
        declarations: [MockComponent]
      });

      const store = getStore();
      const fixture = TestBed.createComponent(MockComponent);
      fixture.detectChanges();

      // Assert
      expect(store.selectSnapshot(({ todos }) => todos).todosForm).toEqual({
        model: { text: null },
        dirty: false,
        status: 'VALID',
        errors: {}
      });

      fixture.componentInstance.form.controls.text.setValue('Buy some coffee');

      expect(store.selectSnapshot(({ todos }) => todos).todosForm).toEqual({
        model: { text: 'Buy some coffee' },
        dirty: false,
        status: 'VALID',
        errors: {}
      });
    });

    it('should update the state synchronously when form\'s updateOn is "submit"', () => {
      // Arrange
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

      // Act
      TestBed.configureTestingModule({
        imports: [
          ReactiveFormsModule,
          NgxsModule.forRoot([TodosState]),
          NgxsFormPluginModule.forRoot()
        ],
        declarations: [MockComponent]
      });

      const store = getStore();
      const fixture = TestBed.createComponent(MockComponent);
      fixture.detectChanges();

      // Assert
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
      // Arrange
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

      // Act
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

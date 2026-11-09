import { Component, Injectable } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Action, NgxsModule, State, StateContext, Store } from '@ngxs/store';
import { patch } from '@ngxs/store/operators';
import { tap } from 'rxjs';

import { NgxsFormPluginModule, ResetForm } from '../../';

describe('ResetForm completion (https://github.com/ngxs/store/issues/2091)', () => {
  interface FormModel {
    field1: string;
    field2: string;
  }

  interface FormsStateModel {
    form1: {
      model: FormModel;
      dirty: boolean;
      status: string;
      errors: any;
    };
  }

  class NewForm {
    static readonly type = '[Forms] New';
    constructor(public payload: Partial<FormModel>) {}
  }

  @State<FormsStateModel>({
    name: 'forms',
    defaults: {
      form1: {
        model: { field1: 'a', field2: 'b' },
        dirty: false,
        status: 'VALID',
        errors: undefined
      }
    }
  })
  @Injectable()
  class FormsState {
    @Action(NewForm)
    newForm(ctx: StateContext<FormsStateModel>, { payload }: NewForm) {
      return ctx
        .dispatch(
          new ResetForm({ path: 'forms.form1', value: { field1: 'foo', field2: 'bar' } })
        )
        .pipe(
          tap(() => {
            ctx.setState(patch({ form1: patch({ model: patch(payload) }) }));
          })
        );
    }
  }

  @Component({
    template: `
      <form [formGroup]="form" ngxsForm="forms.form1">
        <input formControlName="field1" />
        <input formControlName="field2" />
      </form>
    `,
    standalone: false
  })
  class FormComponent {
    form = new FormGroup({
      field1: new FormControl(''),
      field2: new FormControl('')
    });
  }

  const testSetup = () => {
    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        NgxsModule.forRoot([FormsState]),
        NgxsFormPluginModule.forRoot()
      ],
      declarations: [FormComponent]
    });

    const store = TestBed.inject(Store);
    const fixture = TestBed.createComponent(FormComponent);
    fixture.detectChanges();
    return { store, fixture };
  };

  it('should not overwrite state set after ResetForm completes', fakeAsync(() => {
    // Arrange
    const { store, fixture } = testSetup();
    tick(200);

    // Act
    store.dispatch(new NewForm({ field1: 'x', field2: 'y' }));
    tick(200);
    fixture.detectChanges();

    // Assert
    expect(store.selectSnapshot(state => state.forms.form1.model)).toEqual({
      field1: 'x',
      field2: 'y'
    });
    expect(fixture.componentInstance.form.getRawValue()).toEqual({
      field1: 'x',
      field2: 'y'
    });
  }));

  it('should have reset the form and its state by the time ResetForm completes', () => {
    // Arrange
    const { store, fixture } = testSetup();
    fixture.componentInstance.form.setValue({ field1: 'changed', field2: 'changed' });
    fixture.componentInstance.form.markAsDirty();
    let formValueOnComplete: unknown;
    let formStateOnComplete: unknown;

    // Act
    store
      .dispatch(new ResetForm({ path: 'forms.form1', value: { field1: 'foo' } }))
      .subscribe(() => {
        formValueOnComplete = fixture.componentInstance.form.getRawValue();
        formStateOnComplete = store.selectSnapshot(state => state.forms.form1);
      });

    // Assert
    expect(formValueOnComplete).toEqual({ field1: 'foo', field2: null });
    expect(formStateOnComplete).toEqual({
      model: { field1: 'foo', field2: null },
      dirty: false,
      status: 'VALID',
      errors: {}
    });
  });
});

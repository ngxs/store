import { Component, Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { NgxsModule, NgxsSimpleChange, State, Store } from '@ngxs/store';

import { NgxsFormPluginModule } from '../../';

describe('ngxsOnChanges with form plugin (https://github.com/ngxs/store/issues/1567)', () => {
  const formStateRecorder: unknown[] = [];
  const ngxsOnChangesRecorder: NgxsSimpleChange[] = [];

  @State({
    name: 'form',
    defaults: {
      details: {
        model: [],
        dirty: false,
        status: '',
        errors: {}
      }
    }
  })
  @Injectable()
  class FormState {
    constructor(store: Store) {
      store
        .select(state => state.form)
        .subscribe(formState => formStateRecorder.push(formState));
    }

    ngxsOnChanges(change: NgxsSimpleChange): void {
      ngxsOnChangesRecorder.push(change);
    }
  }

  @Component({
    template: `
      <form [formGroup]="form" ngxsForm="form">
        <input id="name" formControlName="name" />
      </form>
    `
  })
  class TestComponent {
    form = this._fb.group({
      name: ['']
    });

    constructor(private _fb: FormBuilder) {}
  }

  const testSetup = () => {
    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        NgxsModule.forRoot([FormState]),
        NgxsFormPluginModule.forRoot()
      ],
      declarations: [TestComponent]
    });

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    return { fixture };
  };

  it('should call ngxsOnChanges respectively when plugin updates the state', () => {
    // Arrange
    testSetup();

    // Assert
    expect(formStateRecorder[0]).toEqual(undefined);
    expect(ngxsOnChangesRecorder[0]).toEqual({
      previousValue: undefined,
      currentValue: {
        details: { model: [], dirty: false, status: '', errors: {} }
      },
      firstChange: true
    });

    expect(formStateRecorder[1]).toEqual({
      details: { model: [], dirty: false, status: '', errors: {} }
    });

    expect(ngxsOnChangesRecorder[1]).toEqual({
      previousValue: {
        details: { model: [], dirty: false, status: '', errors: {} }
      },
      currentValue: {
        details: { model: [], dirty: false, status: '', errors: {} },
        model: {
          name: ''
        }
      },
      firstChange: false
    });

    expect(formStateRecorder[2]).toEqual({
      details: { model: [], dirty: false, status: '', errors: {} },
      model: {
        name: ''
      }
    });

    expect(ngxsOnChangesRecorder[2]).toEqual({
      previousValue: {
        details: { model: [], dirty: false, status: '', errors: {} },
        model: {
          name: ''
        }
      },
      currentValue: {
        details: { model: [], dirty: false, status: '', errors: {} },
        model: {
          name: ''
        },
        status: 'VALID'
      },
      firstChange: false
    });

    expect(formStateRecorder[3]).toEqual({
      details: { model: [], dirty: false, status: '', errors: {} },
      model: {
        name: ''
      },
      status: 'VALID'
    });

    expect(ngxsOnChangesRecorder[3]).toEqual({
      previousValue: {
        details: { model: [], dirty: false, status: '', errors: {} },
        model: {
          name: ''
        },
        status: 'VALID'
      },
      currentValue: {
        details: { model: [], dirty: false, status: '', errors: {} },
        model: {
          name: ''
        },
        status: 'VALID',
        dirty: false
      },
      firstChange: false
    });

    expect(formStateRecorder[4]).toEqual({
      details: { model: [], dirty: false, status: '', errors: {} },
      model: { name: '' },
      status: 'VALID',
      dirty: false
    });
  });
});

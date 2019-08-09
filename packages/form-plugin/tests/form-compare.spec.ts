import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { State, NgxsModule, Actions, ofActionDispatched } from '@ngxs/store';

import { NgxsFormPluginModule, UpdateFormValue } from '..';

describe('NgxsFormPlugin compare', () => {
  @State({
    name: 'novels',
    defaults: {
      newNovelForm: {
        model: undefined
      }
    }
  })
  class NovelsState {}

  it('should use default compare if "ngxsFormUseDefaultCompare" is true', () => {
    // Arrange
    @Component({
      template: `
        <form
          [formGroup]="form"
          ngxsForm="novels.newNovelForm"
          [ngxsFormDebounce]="-1"
          [ngxsFormUseDefaultCompare]="true"
        >
          <input type="text" formControlName="name" />
        </form>
      `
    })
    class NovelsComponent {
      form = new FormGroup({
        name: new FormControl()
      });
    }

    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        NgxsModule.forRoot([NovelsState]),
        NgxsFormPluginModule.forRoot()
      ],
      declarations: [NovelsComponent]
    });

    // Act
    const actions$: Actions = TestBed.get(Actions);
    const fixture = TestBed.createComponent(NovelsComponent);
    fixture.detectChanges();

    let dispatchedTimes = 0;

    const subscription = actions$.pipe(ofActionDispatched(UpdateFormValue)).subscribe(() => {
      dispatchedTimes++;
    });

    fixture.componentInstance.form.setValue({
      name: 'NGXS'
    });

    fixture.componentInstance.form.setValue({
      name: 'NGXS'
    });

    fixture.componentInstance.form.setValue({
      name: 'NGXS'
    });

    subscription.unsubscribe();

    // Assert
    expect(dispatchedTimes).toEqual(1);
  });

  it('should be possible to provide a custom "ngxsFormCompare" binding', () => {
    // Arrange
    @Component({
      template: `
        <form
          [formGroup]="form"
          ngxsForm="novels.newNovelForm"
          [ngxsFormDebounce]="-1"
          [ngxsFormCompare]="compare"
        >
          <input type="text" formControlName="name" />
        </form>
      `
    })
    class NovelsComponent {
      form = new FormGroup({
        name: new FormControl()
      });

      compare = (a: any, b: any) => a.name === b.name;
    }

    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        NgxsModule.forRoot([NovelsState]),
        NgxsFormPluginModule.forRoot()
      ],
      declarations: [NovelsComponent]
    });

    // Act
    const actions$: Actions = TestBed.get(Actions);
    const fixture = TestBed.createComponent(NovelsComponent);
    fixture.detectChanges();

    let dispatchedTimes = 0;

    const subscription = actions$.pipe(ofActionDispatched(UpdateFormValue)).subscribe(() => {
      dispatchedTimes++;
    });

    fixture.componentInstance.form.setValue({
      name: 'NGXS'
    });

    fixture.componentInstance.form.setValue({
      name: 'NGXS'
    });

    fixture.componentInstance.form.setValue({
      name: 'Zenith'
    });

    subscription.unsubscribe();

    // Assert
    expect(dispatchedTimes).toEqual(2);
  });
});

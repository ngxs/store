import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { State, NgxsModule, Actions, ofActionDispatched } from '@ngxs/store';
import { Observable } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

import { NGXS_FORM_PLUGIN_VALUE_CHANGES_STRATEGY } from '../src/symbols';
import { DefaultNgxsFormPluginValueChangesStrategy } from '../src/value-changes-strategy';
import { NgxsFormPluginModule, UpdateFormValue, NgxsFormPluginValueChangesStrategy } from '..';

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

  @Component({
    template: `
      <form [formGroup]="form" ngxsForm="novels.newNovelForm" [ngxsFormDebounce]="-1">
        <input type="text" formControlName="name" />
      </form>
    `
  })
  class NovelsComponent {
    form = new FormGroup({
      name: new FormControl()
    });
  }

  it('should use default value changes strategy if nothing is provided', () => {
    // Arrange
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([]), NgxsFormPluginModule.forRoot()]
    });

    // Act
    const valueChangesStrategy: NgxsFormPluginValueChangesStrategy = TestBed.get(
      NGXS_FORM_PLUGIN_VALUE_CHANGES_STRATEGY
    );

    // Assert
    expect(valueChangesStrategy).toBeTruthy();
    expect(valueChangesStrategy).toBeInstanceOf(DefaultNgxsFormPluginValueChangesStrategy);
  });

  it('should be possible to provide custom value changes strategy', () => {
    // Arrange
    class CustomNgxsFormPluginValueChangesStrategy
      implements NgxsFormPluginValueChangesStrategy {
      valueChanges() {
        return (changes: Observable<any>) => changes;
      }
    }

    TestBed.configureTestingModule({
      imports: [
        NgxsModule.forRoot(),
        NgxsFormPluginModule.forRoot({
          valueChangesStrategy: CustomNgxsFormPluginValueChangesStrategy
        })
      ]
    });

    // Act
    const valueChangesStrategy: NgxsFormPluginValueChangesStrategy = TestBed.get(
      NGXS_FORM_PLUGIN_VALUE_CHANGES_STRATEGY
    );

    // Assert
    expect(valueChangesStrategy).toBeTruthy();
    expect(valueChangesStrategy).toBeInstanceOf(CustomNgxsFormPluginValueChangesStrategy);
  });

  it('default strategy should act like a noop', () => {
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

    Array.from({ length: 5 }).forEach(() => {
      // Set the same value 5 times
      fixture.componentInstance.form.setValue({
        name: 'NGXS'
      });
    });

    fixture.componentInstance.form.setValue({
      name: 'Zenith'
    });

    subscription.unsubscribe();

    // Assert
    expect(dispatchedTimes).toBe(6);
  });

  it('should pipe via "distinctUntilChanged" if custom strategy provided with such operator', () => {
    // Arrange
    class CustomNgxsFormPluginValueChangesStrategy
      implements NgxsFormPluginValueChangesStrategy {
      valueChanges() {
        return (changes: Observable<any>) =>
          changes.pipe(
            distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
          );
      }
    }

    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        NgxsModule.forRoot([NovelsState]),
        NgxsFormPluginModule.forRoot({
          valueChangesStrategy: CustomNgxsFormPluginValueChangesStrategy
        })
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

    Array.from({ length: 5 }).forEach(() => {
      // Set the same value 5 times
      fixture.componentInstance.form.setValue({
        name: 'NGXS'
      });
    });

    fixture.componentInstance.form.setValue({
      name: 'Zenith'
    });

    subscription.unsubscribe();

    // Assert
    expect(dispatchedTimes).toBe(2);
  });
});

import { TestBed } from '@angular/core/testing';
import { Component, ViewChild, Injectable } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { State, NgxsModule, Actions, ofActionDispatched } from '@ngxs/store';
import { Observable } from 'rxjs';

import { NoopNgxsFormPluginValueChangesStrategy } from '../src/value-changes-strategy';
import {
  NgxsFormPluginModule,
  UpdateFormValue,
  NgxsFormPluginValueChangesStrategy,
  DeepEqualNgxsFormPluginValueChangesStrategy
} from '..';
import { FormDirective } from '../src/directive';

fdescribe('NgxsFormPluginValueChangesStrategy', () => {
  @State({
    name: 'novels',
    defaults: {
      newNovelForm: {
        model: undefined
      }
    }
  })
  class NovelsState {}

  it('should use noop value changes strategy if nothing is provided', () => {
    // Arrange
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

      @ViewChild(FormDirective, { static: true }) ngxsForm: FormDirective;
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
    const fixture = TestBed.createComponent(NovelsComponent);
    fixture.detectChanges();

    const { valueChangesStrategy } = fixture.componentInstance.ngxsForm;

    // Assert
    expect(valueChangesStrategy).toBeTruthy();
    expect(valueChangesStrategy).toBe(NoopNgxsFormPluginValueChangesStrategy);
  });

  it('should be possible to provide custom value changes strategy', () => {
    // Arrange
    let instantiatedEagerly = false;

    @Injectable()
    class CustomNgxsFormPluginValueChangesStrategy
      implements NgxsFormPluginValueChangesStrategy {
      constructor() {
        // Make sure that the class is retrieved via
        // injector eagerly
        instantiatedEagerly = true;
      }

      valueChanges() {
        return (changes: Observable<any>) => changes;
      }
    }

    @Component({
      template: `
        <form
          [formGroup]="form"
          ngxsForm="novels.newNovelForm"
          [ngxsFormDebounce]="-1"
          [ngxsFormValueChangesStrategy]="CustomNgxsFormPluginValueChangesStrategy"
        >
          <input type="text" formControlName="name" />
        </form>
      `
    })
    class NovelsComponent {
      form = new FormGroup({
        name: new FormControl()
      });

      @ViewChild(FormDirective, { static: true }) ngxsForm: FormDirective;

      CustomNgxsFormPluginValueChangesStrategy = CustomNgxsFormPluginValueChangesStrategy;
    }

    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        NgxsModule.forRoot([NovelsState]),
        NgxsFormPluginModule.forRoot()
      ],
      declarations: [NovelsComponent],
      providers: [CustomNgxsFormPluginValueChangesStrategy]
    });

    // Act
    const fixture = TestBed.createComponent(NovelsComponent);
    fixture.detectChanges();

    const { valueChangesStrategy } = fixture.componentInstance.ngxsForm;

    // Assert
    expect(instantiatedEagerly).toBeTruthy();
    expect(valueChangesStrategy).toBeTruthy();
    expect(valueChangesStrategy).toBe(CustomNgxsFormPluginValueChangesStrategy);
  });

  describe('Runtime behavior', () => {
    it('default strategy should act like a noop', () => {
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

      for (let i = 0; i < 5; i++) {
        // Set the same value 5 times
        fixture.componentInstance.form.setValue({
          name: 'NGXS'
        });
      }

      // Change the value for the 6th time
      fixture.componentInstance.form.setValue({
        name: 'Zenith'
      });

      subscription.unsubscribe();

      // Assert
      expect(dispatchedTimes).toBe(6);
    });

    it('should be possible to use deep equal strategy', () => {
      // Arrange
      @Component({
        template: `
          <form
            [formGroup]="form"
            ngxsForm="novels.newNovelForm"
            [ngxsFormDebounce]="-1"
            [ngxsFormValueChangesStrategy]="DeepEqualNgxsFormPluginValueChangesStrategy"
          >
            <input type="text" formControlName="name" />
          </form>
        `
      })
      class NovelsComponent {
        form = new FormGroup({
          name: new FormControl()
        });

        @ViewChild(FormDirective, { static: true }) ngxsForm: FormDirective;

        DeepEqualNgxsFormPluginValueChangesStrategy = DeepEqualNgxsFormPluginValueChangesStrategy;
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

      for (let i = 0; i < 5; i++) {
        // Set the same value 5 times
        fixture.componentInstance.form.setValue({
          name: 'NGXS'
        });
      }

      // Change the value for the 6th time
      fixture.componentInstance.form.setValue({
        name: 'Zenith'
      });

      subscription.unsubscribe();

      // Assert
      expect(dispatchedTimes).toBe(2);
    });
  });
});

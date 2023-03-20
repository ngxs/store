import { TestBed } from '@angular/core/testing';
import { Component, Injectable } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { NgxsModule, State, Actions, ofActionDispatched, Store, Selector } from '@ngxs/store';

import { NgxsFormPluginModule, UpdateFormValue } from '../../';

describe('Multiple `ngxsForm` bindings (https://github.com/ngxs/store/issues/1822)', () => {
  interface UserStateModel {
    userForm: {
      model: {
        name: string;
        surname: string;
      };
    };
  }

  @State<UserStateModel>({
    name: 'user',
    defaults: {
      userForm: {
        model: {
          name: 'John',
          surname: 'Doe'
        }
      }
    }
  })
  @Injectable()
  class UserState {
    @Selector()
    static getModel(state: UserStateModel) {
      return state.userForm.model;
    }
  }

  @Component({
    template: `
      <form [formGroup]="form" ngxsForm="user.userForm">
        <input id="name" formControlName="name" />
      </form>

      <form [formGroup]="form" ngxsForm="user.userForm">
        <input id="surname" formControlName="surname" />
      </form>
    `
  })
  class TestComponent {
    form = new FormGroup({
      name: new FormControl(),
      surname: new FormControl()
    });
  }

  const testSetup = () => {
    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        NgxsModule.forRoot([UserState]),
        NgxsFormPluginModule.forRoot()
      ],
      declarations: [TestComponent]
    });
    const store = TestBed.inject(Store);
    const actions$ = TestBed.inject(Actions);
    const fixture = TestBed.createComponent(TestComponent);
    return { store, actions$, fixture };
  };

  it('should not get into an infinite loop when `ngxsForm` is bound multiple times', async () => {
    // Arrange
    let updateFormValueDispatchedTimes = 0;
    const { store, actions$, fixture } = testSetup();
    const subscription = actions$.pipe(ofActionDispatched(UpdateFormValue)).subscribe(() => {
      updateFormValueDispatchedTimes++;
    });
    fixture.detectChanges();
    const nameInput = document.querySelector<HTMLInputElement>('#name')!;
    const surnameInput = document.querySelector<HTMLInputElement>('#surname')!;
    // Assert
    expect(nameInput.value).toEqual('John');
    expect(surnameInput.value).toEqual('Doe');
    // Act
    nameInput.value = 'Artur';
    nameInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();
    // Assert
    expect(store.selectSnapshot(UserState.getModel)).toEqual({
      name: 'Artur',
      surname: 'Doe'
    });
    // Act
    surnameInput.value = 'Daniels';
    surnameInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();
    // Assert
    expect(store.selectSnapshot(UserState.getModel)).toEqual({
      name: 'Artur',
      surname: 'Daniels'
    });
    expect(updateFormValueDispatchedTimes).toEqual(6);
    subscription.unsubscribe();
  });
});

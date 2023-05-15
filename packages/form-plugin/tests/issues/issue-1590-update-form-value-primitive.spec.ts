import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NgxsModule, Selector, State, Store } from '@ngxs/store';

import { UpdateFormValue, NgxsFormPluginModule } from '../../';

describe('UpdateFormValue with primitives (https://github.com/ngxs/store/issues/1590)', () => {
  interface PizzaStateModel {
    pizzaForm: {
      model?: object;
    };
  }

  @State({
    name: 'pizza',
    defaults: {
      pizzaForm: {
        model: undefined,
        dirty: false,
        status: '',
        errors: {}
      }
    }
  })
  @Injectable()
  class PizzaState {
    @Selector()
    static getModel(state: PizzaStateModel) {
      return state.pizzaForm.model;
    }
  }

  const testSetup = () => {
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([PizzaState]), NgxsFormPluginModule.forRoot()]
    });

    return { store: TestBed.inject(Store) };
  };

  it('should update the model with a string primitive', () => {
    // Arrange
    const { store } = testSetup();
    // Assert
    expect(store.selectSnapshot(PizzaState.getModel)).toEqual(undefined);
    // Act
    store.dispatch(
      new UpdateFormValue({
        path: 'pizza.pizzaForm',
        propertyPath: 'type',
        value: 'pepperoni'
      })
    );
    // Assert
    expect(store.selectSnapshot(PizzaState.getModel)).toEqual({
      type: 'pepperoni'
    });
  });

  it('should update the model with a number primitive', () => {
    // Arrange
    const { store } = testSetup();
    // Act
    store.dispatch(
      new UpdateFormValue({
        path: 'pizza.pizzaForm',
        propertyPath: 'numberOfPizzas',
        value: 100
      })
    );
    // Assert
    expect(store.selectSnapshot(PizzaState.getModel)).toEqual({
      numberOfPizzas: 100
    });
  });

  it('should update the model with multiple primitives', () => {
    // Arrange
    const { store } = testSetup();
    // Act
    store.dispatch([
      new UpdateFormValue({
        path: 'pizza.pizzaForm',
        propertyPath: 'pizzaQuality',
        value: null
      }),
      new UpdateFormValue({
        path: 'pizza.pizzaForm',
        propertyPath: 'pizzasCooked',
        value: undefined
      })
    ]);
    // Assert
    expect(store.selectSnapshot(PizzaState.getModel)).toEqual({
      pizzaQuality: null,
      pizzasCooked: undefined
    });
  });
});

import { Injectable, runInInjectionContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Action, Selector, State, StateContext, provideStore } from '@ngxs/store';
import { createDispatchMap, createSelectMap } from '@ngxs/signals';
import { firstValueFrom } from 'rxjs';

describe('createDispatchMap', () => {
  class Add {
    static type = 'Add';

    constructor(readonly value: number) {}
  }

  @State({
    name: 'number',
    defaults: 0
  })
  @Injectable()
  class NumberState {
    @Selector()
    static getNumber(state: number) {
      return state;
    }

    @Action(Add)
    add(ctx: StateContext<number>, action: Add) {
      ctx.setState(value => value + action.value);
    }
  }

  const testSetup = () => {
    TestBed.configureTestingModule({
      providers: [provideStore([NumberState])]
    });
  };

  it('should dispatch and update the value', async () => {
    // Arrange
    testSetup();

    // Act
    const selectors = runInInjectionContext(TestBed, () =>
      createSelectMap({
        number: NumberState.getNumber
      })
    );

    const dispatchers = runInInjectionContext(TestBed, () =>
      createDispatchMap({
        add: Add
      })
    );

    dispatchers.add(10);
    dispatchers.add(10);
    await firstValueFrom(dispatchers.add(10));

    // Assert
    expect(selectors.number()).toEqual(30);
  });
});

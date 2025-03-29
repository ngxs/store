import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  Action,
  DispatchOutsideZoneNgxsExecutionStrategy,
  provideStore,
  State,
  Store
} from '@ngxs/store';

describe('dispatch() with nullable arguments', () => {
  class MyAction {
    static type = '[MyState] My action';
  }

  @State<string>({
    name: 'myState',
    defaults: 'STATE_VALUE'
  })
  @Injectable()
  class MyState {
    @Action(MyAction)
    handleAction() {
      // Empty.
    }
  }

  const testSetup = () => {
    TestBed.configureTestingModule({
      providers: [
        provideStore([MyState], {
          executionStrategy: DispatchOutsideZoneNgxsExecutionStrategy
        })
      ]
    });

    return TestBed.inject(Store);
  };

  it('should throw an error when `dispatch()` is called with nullable arguments', () => {
    // Arrange
    const recordedErrors: Error[] = [];
    const args = [null, undefined, [new MyAction(), null], [new MyAction(), undefined]];
    const store = testSetup();

    // Act
    args.forEach(arg =>
      store.dispatch(arg).subscribe({
        error: error => recordedErrors.push(error)
      })
    );

    // Assert
    expect(recordedErrors.length).toEqual(4);
    recordedErrors.forEach(error =>
      expect(error.message).toEqual('`dispatch()` was called without providing an action.')
    );
  });
});

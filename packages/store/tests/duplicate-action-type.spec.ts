import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  Action,
  State,
  StateContext,
  Store,
  provideStore,
  withNgxsDevelopmentOptions
} from '@ngxs/store';

describe('Duplicate action type warnings', () => {
  beforeEach(() => TestBed.resetTestingModule());

  it('should warn when two unrelated action classes share the same type', () => {
    // Arrange
    class FooA {
      static type = '[Duplicate] Foo';
      constructor(public a: number) {}
    }
    class FooB {
      static type = '[Duplicate] Foo';
      constructor(public b: string) {}
    }

    @State({ name: 'stateA', defaults: {} })
    @Injectable()
    class StateA {
      @Action(FooA)
      handle(_ctx: StateContext<any>, _action: FooA) {}
    }

    @State({ name: 'stateB', defaults: {} })
    @Injectable()
    class StateB {
      @Action(FooB)
      handle(_ctx: StateContext<any>, _action: FooB) {}
    }

    TestBed.configureTestingModule({
      providers: [
        provideStore(
          [StateA, StateB],
          withNgxsDevelopmentOptions({
            warnOnUnhandledActions: true,
            warnOnDuplicateActionTypes: true
          })
        )
      ]
    });
    const errorSpy = jest.spyOn(console, 'error').mockImplementation();

    try {
      // Act
      TestBed.inject(Store);

      // Assert
      expect(errorSpy).toHaveBeenCalledWith(
        'Multiple action classes are using the same type "[Duplicate] Foo". Every handler ' +
          'registered for this type will run whenever either action is dispatched, even though ' +
          'their payloads may differ. Action types must be unique.'
      );
    } finally {
      errorSpy.mockRestore();
    }
  });

  it('should not warn when warnOnDuplicateActionTypes is not enabled', () => {
    // Arrange
    class FooA {
      static type = '[Duplicate] Foo';
      constructor(public a: number) {}
    }
    class FooB {
      static type = '[Duplicate] Foo';
      constructor(public b: string) {}
    }

    @State({ name: 'stateA', defaults: {} })
    @Injectable()
    class StateA {
      @Action(FooA)
      handle(_ctx: StateContext<any>, _action: FooA) {}
    }

    @State({ name: 'stateB', defaults: {} })
    @Injectable()
    class StateB {
      @Action(FooB)
      handle(_ctx: StateContext<any>, _action: FooB) {}
    }

    TestBed.configureTestingModule({
      providers: [provideStore([StateA, StateB])]
    });
    const errorSpy = jest.spyOn(console, 'error').mockImplementation();

    try {
      // Act
      TestBed.inject(Store);

      // Assert
      expect(errorSpy).not.toHaveBeenCalled();
    } finally {
      errorSpy.mockRestore();
    }
  });

  it('should not warn when the same action class is handled by multiple states', () => {
    // Arrange
    class Shared {
      static type = '[Duplicate] Shared';
    }

    @State({ name: 'stateA', defaults: {} })
    @Injectable()
    class StateA {
      @Action(Shared)
      handle() {}
    }

    @State({ name: 'stateB', defaults: {} })
    @Injectable()
    class StateB {
      @Action(Shared)
      handle() {}
    }

    TestBed.configureTestingModule({
      providers: [
        provideStore(
          [StateA, StateB],
          withNgxsDevelopmentOptions({
            warnOnUnhandledActions: true,
            warnOnDuplicateActionTypes: true
          })
        )
      ]
    });
    const errorSpy = jest.spyOn(console, 'error').mockImplementation();

    try {
      // Act
      TestBed.inject(Store);

      // Assert
      expect(errorSpy).not.toHaveBeenCalled();
    } finally {
      errorSpy.mockRestore();
    }
  });

  it('should not warn when multiple handlers use the `{ type: string }` shorthand', () => {
    // Arrange
    @State({ name: 'stateA', defaults: {} })
    @Injectable()
    class StateA {
      @Action({ type: '[Duplicate] Shorthand' })
      handleOne() {}

      @Action({ type: '[Duplicate] Shorthand' })
      handleTwo() {}
    }

    TestBed.configureTestingModule({
      providers: [
        provideStore(
          [StateA],
          withNgxsDevelopmentOptions({
            warnOnUnhandledActions: true,
            warnOnDuplicateActionTypes: true
          })
        )
      ]
    });
    const errorSpy = jest.spyOn(console, 'error').mockImplementation();

    try {
      // Act
      TestBed.inject(Store);

      // Assert
      expect(errorSpy).not.toHaveBeenCalled();
    } finally {
      errorSpy.mockRestore();
    }
  });

  it('should not warn for unrelated action types', () => {
    // Arrange
    class FooA {
      static type = '[Duplicate] FooA';
    }
    class FooB {
      static type = '[Duplicate] FooB';
    }

    @State({ name: 'stateA', defaults: {} })
    @Injectable()
    class StateA {
      @Action(FooA)
      handleA() {}

      @Action(FooB)
      handleB() {}
    }

    TestBed.configureTestingModule({
      providers: [
        provideStore(
          [StateA],
          withNgxsDevelopmentOptions({
            warnOnUnhandledActions: true,
            warnOnDuplicateActionTypes: true
          })
        )
      ]
    });
    const errorSpy = jest.spyOn(console, 'error').mockImplementation();

    try {
      // Act
      TestBed.inject(Store);

      // Assert
      expect(errorSpy).not.toHaveBeenCalled();
    } finally {
      errorSpy.mockRestore();
    }
  });
});

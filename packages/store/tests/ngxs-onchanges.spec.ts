import {
  Action,
  NgxsModule,
  NgxsOnChanges,
  NgxsSimpleChange,
  State,
  StateContext,
  Store
} from '@ngxs/store';
import { TestBed } from '@angular/core/testing';
import { Injectable } from '@angular/core';

describe('ngxsOnChanges', () => {
  fit('should call ngxsOnChanges correctly with a simple state', () => {
    // Arrange
    class Increment {
      static readonly type = 'Increment';
    }

    class Decrement {
      static readonly type = 'Decrement';
    }

    const recorder: NgxsSimpleChange[] = [];

    @State({
      name: 'counter',
      defaults: 0
    })
    @Injectable()
    class CounterState implements NgxsOnChanges {
      ngxsOnChanges(change: NgxsSimpleChange): void {
        recorder.push(change);
      }

      @Action(Increment)
      increment(ctx: StateContext<number>) {
        ctx.setState(state => ++state);
      }

      @Action(Decrement)
      decrement(ctx: StateContext<number>) {
        ctx.setState(state => --state);
      }
    }

    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([CounterState])]
    });

    const store = TestBed.inject(Store);

    // Act
    store.dispatch(new Increment());
    store.dispatch(new Increment());
    store.dispatch(new Increment());
    store.dispatch(new Decrement());
    store.dispatch(new Increment());

    // Assert
    expect(recorder).toEqual([
      // Initialization
      { previousValue: undefined, currentValue: 0, firstChange: true },
      // Increment
      { previousValue: 0, currentValue: 1, firstChange: false },
      // Increment
      { previousValue: 1, currentValue: 2, firstChange: false },
      // Increment
      { previousValue: 2, currentValue: 3, firstChange: false },
      // Decrement
      { previousValue: 3, currentValue: 2, firstChange: false },
      // Increment
      { previousValue: 2, currentValue: 3, firstChange: false }
    ]);
  });

  fit('should call ngxsOnChanges correctly with child states', () => {
    // Arrange
    const parentStateRecorder: NgxsSimpleChange[] = [];
    const childStateRecorder: NgxsSimpleChange[] = [];

    class IncrementParent {
      static readonly type = 'Increment Parent';
    }

    class DecrementParent {
      static readonly type = 'Decrement Parent';
    }

    class IncrementChild {
      static readonly type = 'Increment Child';
    }

    class DecrementChild {
      static readonly type = 'Decrement Child';
    }

    @State({
      name: 'childCounter',
      defaults: 0
    })
    @Injectable()
    class ChildCounterState implements NgxsOnChanges {
      ngxsOnChanges(change: NgxsSimpleChange<any>): void {
        childStateRecorder.push(change);
      }

      @Action(IncrementChild)
      increment(ctx: StateContext<number>) {
        ctx.setState(state => ++state);
      }

      @Action(DecrementChild)
      decrement(ctx: StateContext<number>) {
        ctx.setState(state => --state);
      }
    }

    @State<{ counter: number }>({
      name: 'parentCounter',
      defaults: {
        counter: 0
      },
      children: [ChildCounterState]
    })
    @Injectable()
    class ParentCounterState implements NgxsOnChanges {
      ngxsOnChanges(change: NgxsSimpleChange<any>): void {
        parentStateRecorder.push(change);
      }

      @Action(IncrementParent)
      increment(ctx: StateContext<{ counter: number }>) {
        ctx.patchState({
          counter: ctx.getState().counter + 1
        });
      }

      @Action(DecrementParent)
      decrement(ctx: StateContext<{ counter: number }>) {
        ctx.patchState({
          counter: ctx.getState().counter - 1
        });
      }
    }

    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([ParentCounterState, ChildCounterState])]
    });

    const store = TestBed.inject(Store);

    // Assert
    expect(store.snapshot()).toEqual({
      parentCounter: {
        counter: 0,
        childCounter: 0
      }
    });

    expect(parentStateRecorder).toEqual([
      {
        previousValue: undefined,
        currentValue: {
          counter: 0,
          childCounter: 0
        },
        firstChange: true
      }
    ]);

    expect(childStateRecorder).toEqual([
      { previousValue: undefined, currentValue: 0, firstChange: true }
    ]);

    // Act
    store.dispatch(new IncrementChild());

    // Assert
    expect(parentStateRecorder).toEqual([
      {
        previousValue: undefined,
        currentValue: {
          counter: 0,
          childCounter: 0
        },
        firstChange: true
      },
      {
        previousValue: {
          counter: 0,
          childCounter: 0
        },
        currentValue: {
          counter: 0,
          childCounter: 1
        },
        firstChange: false
      }
    ]);

    expect(childStateRecorder.length).toEqual(2);
    expect(childStateRecorder).toEqual([
      { previousValue: undefined, currentValue: 0, firstChange: true },
      { previousValue: 0, currentValue: 1, firstChange: false }
    ]);

    // Act
    store.dispatch(new IncrementParent());

    // Assert
    expect(childStateRecorder.length).toEqual(2); // Not changed
    expect(parentStateRecorder).toEqual([
      {
        previousValue: undefined,
        currentValue: {
          counter: 0,
          childCounter: 0
        },
        firstChange: true
      },
      {
        previousValue: {
          counter: 0,
          childCounter: 0
        },
        currentValue: {
          counter: 0,
          childCounter: 1
        },
        firstChange: false
      },
      {
        previousValue: {
          counter: 0,
          childCounter: 1
        },
        currentValue: {
          counter: 1,
          childCounter: 1
        },
        firstChange: false
      }
    ]);
  });
});

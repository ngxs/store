import { Injectable, NgZone } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Action, NgxsModule, State, StateContext, Store } from '@ngxs/store';
import { take } from 'rxjs';

describe('zone', () => {
  class Increment {
    static readonly type = '[Counter] Increment';
  }

  @State<number>({
    name: 'counter',
    defaults: 0
  })
  @Injectable()
  class CounterState {
    @Action(Increment)
    increment({ setState, getState }: StateContext<number>): void {
      setState(getState() + 1);
    }
  }

  // =============================================================
  it('"store.subscribe" should be performed inside Angular zone', () => {
    let nextCalls = 0;
    let nextCallsInAngularZone = 0;

    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([CounterState])]
    });

    const store = TestBed.inject(Store);
    const ngZone = TestBed.inject(NgZone);

    ngZone.runOutsideAngular(() => {
      store.subscribe(() => {
        nextCalls++;
        if (NgZone.isInAngularZone()) {
          nextCallsInAngularZone++;
        }
      });

      store.dispatch(new Increment());
      store.dispatch(new Increment());
    });

    expect(nextCalls).toEqual(3);
    expect(nextCallsInAngularZone).toEqual(3);
  });
  // =============================================================

  // =============================================================
  it('"select" should be performed inside Angular zone', () => {
    let selectCalls = 0;
    let selectCallsInAngularZone = 0;

    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([CounterState])]
    });

    const store = TestBed.inject(Store);
    const zone = TestBed.inject(NgZone);

    zone.runOutsideAngular(() => {
      store
        .select<number>(({ counter }) => counter)
        .pipe(take(3))
        .subscribe(() => {
          selectCalls++;
          if (NgZone.isInAngularZone()) {
            selectCallsInAngularZone++;
          }
        });

      store.dispatch(new Increment());
      store.dispatch(new Increment());
    });

    expect(selectCalls).toEqual(3);
    expect(selectCallsInAngularZone).toEqual(3);
  });
  // =============================================================

  it('action should be handled outside zone by default', () => {
    // Arrange
    let isInAngularZone: boolean | null = null;

    class FooAction {
      static readonly type = 'Foo';
    }

    @State({
      name: 'foo'
    })
    @Injectable()
    class FooState {
      @Action(FooAction)
      fooAction(): void {
        isInAngularZone = NgZone.isInAngularZone();
      }
    }

    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([FooState])]
    });

    const store = TestBed.inject(Store);
    // Act
    store.dispatch(new FooAction());

    // Assert
    expect(isInAngularZone).toEqual(false);
  });

  it('action should be handled outside zone (event if wrapped with `ngZone.run`', () => {
    // Arrange
    let isInAngularZone: boolean | null = null;

    class FooAction {
      static readonly type = 'Foo';
    }

    @State({
      name: 'foo'
    })
    @Injectable()
    class FooState {
      @Action(FooAction)
      fooAction(): void {
        isInAngularZone = NgZone.isInAngularZone();
      }
    }

    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([FooState])]
    });

    const store = TestBed.inject(Store);
    const ngZone = TestBed.inject(NgZone);

    // Act
    ngZone.run(() => {
      store.dispatch(new FooAction());
    });

    // Assert
    expect(isInAngularZone).toEqual(false);
  });
});

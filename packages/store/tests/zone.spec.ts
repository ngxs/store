import { ApplicationRef, NgZone, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { Observable, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

import { State, Action, StateContext, NgxsModule, Store, Select } from '../src/public_api';
import { wrap } from '../src/operators/wrap';

describe('zone', () => {
  class Increment {
    public static readonly type = '[Counter] Increment';
  }

  @State<number>({
    name: 'counter',
    defaults: 0
  })
  class CounterState {
    @Action(Increment)
    public increment({ setState, getState }: StateContext<number>): void {
      setState(getState() + 1);
    }
  }

  it('"select" should be performed inside Angular zone', () => {
    let ticks = 0;

    class MockApplicationRef extends ApplicationRef {
      public tick(): void {
        ticks++;
      }
    }

    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([CounterState])],
      providers: [
        {
          provide: ApplicationRef,
          useClass: MockApplicationRef
        }
      ]
    });

    const store: Store = TestBed.get(Store);
    const zone: NgZone = TestBed.get(NgZone);

    // NGXS performes initializions inside Angular zone
    // thus it causes app to tick
    expect(ticks).toBeGreaterThan(0);

    zone.runOutsideAngular(() => {
      store
        .select<number>(({ counter }) => counter)
        .pipe(take(3))
        .subscribe(() => {
          expect(NgZone.isInAngularZone()).toBeTruthy();
        });
    });

    store.dispatch(new Increment());
    store.dispatch(new Increment());

    // Angular has run change detection 5 times
    expect(ticks).toBe(5);
  });

  it('"select" should be performed outside Angular zone', () => {
    let ticks = 0;

    class MockApplicationRef extends ApplicationRef {
      public tick(): void {
        ticks++;
      }
    }

    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([CounterState], { outsideZone: true })],
      providers: [
        {
          provide: ApplicationRef,
          useClass: MockApplicationRef
        }
      ]
    });

    const store: Store = TestBed.get(Store);
    const zone: NgZone = TestBed.get(NgZone);

    // NGXS performed all initializations outside Angular zone
    expect(ticks).toBe(0);

    zone.runOutsideAngular(() => {
      store
        .select<number>(({ counter }) => counter)
        .pipe(take(3))
        .subscribe(() => {
          expect(NgZone.isInAngularZone()).toBeFalsy();
        });
    });

    store.dispatch(new Increment());
    store.dispatch(new Increment());

    // Angular hasn't run any change detection
    expect(ticks).toBe(0);
  });

  // Subscribe to the `counter$` stream
  @Component({ template: '{{ counter$ | async }}' })
  class MockComponent {
    @Select(CounterState)
    public counter$: Observable<number>;
  }

  it('stream should be completed using "wrap" operator w/o memory leaks inside zone', (done: DoneFn) => {
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([CounterState])],
      declarations: [MockComponent]
    });

    let subscription: Subscription = null!;

    const zone: NgZone = TestBed.get(NgZone);
    const store: Store = TestBed.get(Store);
    const fixture = TestBed.createComponent(MockComponent);

    const spy = spyOn(fixture.componentInstance.counter$, 'subscribe').and.callFake(() => {
      subscription = store
        .select<number>(({ counter }) => counter)
        // inside zone
        .pipe(wrap(false, zone))
        .subscribe();
      return subscription;
    });

    fixture.detectChanges();
    fixture.destroy();

    // Use `setTimeout` to do expectations after all tasks
    setTimeout(() => {
      expect(spy).toHaveBeenCalled();
      expect(subscription.closed).toBeTruthy();
      done();
    });
  });

  it('stream should be completed using "wrap" operator w/o memory leaks outside zone', (done: DoneFn) => {
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([CounterState])],
      declarations: [MockComponent]
    });

    let subscription: Subscription = null!;

    const zone: NgZone = TestBed.get(NgZone);
    const store: Store = TestBed.get(Store);
    const fixture = TestBed.createComponent(MockComponent);

    const spy = spyOn(fixture.componentInstance.counter$, 'subscribe').and.callFake(() => {
      subscription = store
        .select<number>(({ counter }) => counter)
        // outside zone
        .pipe(wrap(true, zone))
        .subscribe();
      return subscription;
    });

    fixture.detectChanges();
    fixture.destroy();

    // Use `setTimeout` to do expectations after all tasks
    setTimeout(() => {
      expect(spy).toHaveBeenCalled();
      expect(subscription.closed).toBeTruthy();
      done();
    });
  });

  it('action should be handled inside zone if `outsideZone` equals false', () => {
    class FooAction {
      public static readonly type = 'Foo';
    }

    @State({ name: 'foo' })
    class FooState {
      @Action(FooAction)
      public fooAction(): void {
        expect(NgZone.isInAngularZone()).toBeTruthy();
      }
    }

    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([FooState], { outsideZone: false })]
    });

    const store: Store = TestBed.get(Store);
    store.dispatch(new FooAction());
  });

  it('action should be handled outside zone if `outsideZone` equals false', () => {
    class FooAction {
      public static readonly type = 'Foo';
    }

    @State({ name: 'foo' })
    class FooState {
      @Action(FooAction)
      public fooAction(): void {
        expect(NgZone.isInAngularZone()).toBeFalsy();
      }
    }

    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([FooState], { outsideZone: true })]
    });

    const store: Store = TestBed.get(Store);
    store.dispatch(new FooAction());
  });
});

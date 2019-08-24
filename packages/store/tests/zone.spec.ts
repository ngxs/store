import { ApplicationRef, Component, NgModule, NgZone } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { freshPlatform } from '@ngxs/store/internals/testing';
import { take } from 'rxjs/operators';

import { Action, NgxsModule, State, StateContext, Store } from '../src/public_api';
import { NoopNgxsExecutionStrategy } from '../src/execution/noop-ngxs-execution-strategy';

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

  describe('[store.select]', () => {
    it('should be performed inside Angular zone', () => {
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

        store.dispatch(new Increment());
        store.dispatch(new Increment());
      });

      // Angular has run change detection 5 times
      expect(ticks).toBe(5);
    });
  });

  // =============================================================
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

      store.dispatch(new Increment());
      store.dispatch(new Increment());
    });

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
      imports: [
        NgxsModule.forRoot([CounterState], { executionStrategy: NoopNgxsExecutionStrategy })
      ],
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

      store.dispatch(new Increment());
      store.dispatch(new Increment());
    });

    // Angular hasn't run any change detection
    expect(ticks).toBe(0);
  });

  it('action should be handled inside zone if NoopNgxsExecutionStrategy is used', () => {
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
      imports: [
        NgxsModule.forRoot([FooState], { executionStrategy: NoopNgxsExecutionStrategy })
      ]
    });

    const store: Store = TestBed.get(Store);
    const ngZone: NgZone = TestBed.get(NgZone);
    ngZone.run(() => {
      store.dispatch(new FooAction());
    });
  });

  it('action should be handled outside zone if NoopNgxsExecutionStrategy is used', () => {
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
      imports: [
        NgxsModule.forRoot([FooState], { executionStrategy: NoopNgxsExecutionStrategy })
      ]
    });

    const store: Store = TestBed.get(Store);
    store.dispatch(new FooAction());
  });

  it(
    'actions should be handled outside zone if zone is "nooped"',
    freshPlatform(async () => {
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

      @Component({
        selector: 'app-root',
        template: ''
      })
      class MockComponent {}

      @NgModule({
        imports: [
          BrowserModule,
          NgxsModule.forRoot([FooState], {
            executionStrategy: NoopNgxsExecutionStrategy
          })
        ],
        declarations: [MockComponent],
        bootstrap: [MockComponent]
      })
      class MockModule {}

      const { injector } = await platformBrowserDynamic().bootstrapModule(MockModule, {
        ngZone: 'noop'
      });
      const store = injector.get<Store>(Store);
      store.dispatch(new FooAction());
    })
  );
});

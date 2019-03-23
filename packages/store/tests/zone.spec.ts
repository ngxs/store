import {
  ApplicationRef,
  NgZone,
  Component,
  PlatformRef,
  NgModule,
  DoBootstrap,
  NgModuleRef
} from '@angular/core';
import { TestBed, async, fakeAsync } from '@angular/core/testing';
import {
  ɵDomAdapter as DomAdapter,
  ɵBrowserDomAdapter as BrowserDomAdapter,
  BrowserModule,
  DOCUMENT
} from '@angular/platform-browser';

import { Observable, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

import { State, Action, StateContext, NgxsModule, Store, Select } from '../src/public_api';
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

  function createRootNode(selector = 'app-root'): void {
    const document = TestBed.get(DOCUMENT);
    const adapter: DomAdapter = new BrowserDomAdapter();

    const root = adapter.firstChild(
      adapter.content(adapter.createTemplate(`<${selector}></${selector}>`))
    );

    const oldRoots = adapter.querySelectorAll(document, selector);
    oldRoots.forEach(oldRoot => adapter.remove(oldRoot));

    adapter.appendChild(document.body, root);
  }

  it('actions should be handled outside zone if zone is "nooped"', async(() => {
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
      entryComponents: [MockComponent]
    })
    class MockModule implements DoBootstrap {
      public ngDoBootstrap(app: ApplicationRef): void {
        createRootNode();
        app.bootstrap(MockComponent);
      }
    }

    const platformRef: PlatformRef = TestBed.get(PlatformRef);

    platformRef
      .bootstrapModule(MockModule, {
        ngZone: 'noop'
      })
      .then((module: NgModuleRef<MockModule>) => {
        const store = module.injector.get<Store>(Store);
        store.dispatch(new FooAction());
      });
  }));
});

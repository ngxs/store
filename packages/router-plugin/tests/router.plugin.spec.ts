import {
  Component,
  Provider,
  Type,
  NgModule,
  createPlatform,
  destroyPlatform
} from '@angular/core';
import { DOCUMENT, APP_BASE_HREF } from '@angular/common';
import { TestBed, fakeAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { ɵgetDOM as getDOM, BrowserModule } from '@angular/platform-browser';
import { Router, Params, RouterStateSnapshot, RouterModule, Resolve } from '@angular/router';

import { Observable } from 'rxjs';
import { take, tap, filter, first } from 'rxjs/operators';

import {
  NgxsModule,
  Store,
  Actions,
  ofActionSuccessful,
  State,
  Action,
  StateContext,
  Select,
  Selector
} from '@ngxs/store';

import {
  NgxsRouterPluginModule,
  RouterState,
  RouterStateSerializer,
  Navigate,
  RouterNavigation,
  RouterStateModel,
  RouterDataResolved
} from '../';

describe('NgxsRouterPlugin', () => {
  it('should dispatch router state events', fakeAsync(async () => {
    // Arrange
    createTestModule();
    const router: Router = TestBed.get(Router);
    const store = TestBed.get(Store);
    const log = logOfRouterAndStore(router, store);

    // Act
    await router.navigateByUrl('/');

    // Assert
    expect(log).toEqual([
      { type: 'url', state: undefined }, // init event. has nothing to do with the router
      { type: 'router', event: 'NavigationStart', url: '/' },
      { type: 'router', event: 'RoutesRecognized', url: '/' },
      { type: 'router', event: 'GuardsCheckStart', url: '/' },
      { type: 'url', state: '/' }, // RouterNavigation event in the store
      { type: 'router', event: 'GuardsCheckEnd', url: '/' },
      { type: 'router', event: 'ResolveStart', url: '/' },
      { type: 'router', event: 'ResolveEnd', url: '/' },
      { type: 'router', event: 'NavigationEnd', url: '/' }
    ]);
  }));

  it('should dispatch router state events for another route', fakeAsync(async () => {
    // Arrange
    createTestModule();
    const router: Router = TestBed.get(Router);
    const store = TestBed.get(Store);
    const log = logOfRouterAndStore(router, store);

    // Act
    await router.navigateByUrl('/next');

    expect(log).toEqual([
      { type: 'url', state: undefined }, // init event. has nothing to do with the router
      { type: 'router', event: 'NavigationStart', url: '/next' },
      { type: 'router', event: 'RoutesRecognized', url: '/next' },
      { type: 'router', event: 'GuardsCheckStart', url: '/next' },
      { type: 'url', state: '/next' },
      { type: 'router', event: 'GuardsCheckEnd', url: '/next' },
      { type: 'router', event: 'ResolveStart', url: '/next' },
      { type: 'router', event: 'ResolveEnd', url: '/next' },
      { type: 'router', event: 'NavigationEnd', url: '/next' }
    ]);
  }));

  it('should select router state', fakeAsync(async () => {
    // Arrange
    createTestModule();
    const router: Router = TestBed.get(Router);
    const store: Store = TestBed.get(Store);

    // Act
    await router.navigateByUrl('/testpath');

    // Assert
    const routerState = store.selectSnapshot(RouterState.state)!;
    expect(routerState.url).toEqual('/testpath');

    const routerUrl = store.selectSnapshot(RouterState.url);
    expect(routerUrl).toEqual('/testpath');
  }));

  it('should handle Navigate action', fakeAsync(async () => {
    // Arrange
    createTestModule();
    const store: Store = TestBed.get(Store);

    // Act
    await store.dispatch(new Navigate(['a-path'])).toPromise();

    // Assert
    const routerState = store.selectSnapshot(RouterState.state);
    expect(routerState!.url).toEqual('/a-path');
  }));

  it('should select custom router state', fakeAsync(async () => {
    // Arrange
    interface RouterStateParams {
      url: string;
      queryParams: Params;
    }

    class CustomRouterStateSerializer implements RouterStateSerializer<RouterStateParams> {
      serialize(state: RouterStateSnapshot): RouterStateParams {
        const {
          url,
          root: { queryParams }
        } = state;
        return { url, queryParams };
      }
    }

    createTestModule({
      providers: [{ provide: RouterStateSerializer, useClass: CustomRouterStateSerializer }]
    });

    const store: Store = TestBed.get(Store);

    // Act
    await store.dispatch(new Navigate(['a-path'], { foo: 'bar' })).toPromise();

    // Assert
    const routerState = store.selectSnapshot(state =>
      RouterState.state<RouterStateParams>(state.router)
    );

    expect(routerState!.url).toEqual('/a-path?foo=bar');
    expect(routerState!.queryParams).toBeDefined();
    expect(routerState!.queryParams.foo).toEqual('bar');
  }));

  it('should dispatch `RouterNavigation` event if it was navigated to the same route with query params', fakeAsync(async () => {
    createTestModule();

    const actions$: Actions = TestBed.get(Actions);
    const store: Store = TestBed.get(Store);

    let count = 0;

    actions$
      .pipe(
        ofActionSuccessful(RouterNavigation),
        tap(() => count++),
        take(2),
        filter(() => count === 2)
      )
      .subscribe(() => {
        expect(count).toEqual(2);
      });

    await store
      .dispatch(
        new Navigate(
          ['/route1'],
          {
            a: 10
          },
          {
            queryParamsHandling: 'merge'
          }
        )
      )
      .toPromise();

    await store
      .dispatch(
        new Navigate(
          ['/route1'],
          {
            b: 20
          },
          {
            queryParamsHandling: 'merge'
          }
        )
      )
      .toPromise();

    const routerState = store.selectSnapshot(RouterState.state);
    expect(routerState!.url).toEqual('/route1?a=10&b=20');
  }));

  it('should be possible to access the state snapshot if action is dispatched from the component constructor', fakeAsync(async () => {
    // Arrange
    @State({
      name: 'test',
      defaults: null
    })
    class TestState {
      constructor(private store: Store) {}

      @Action(TestAction)
      testAction({ setState }: StateContext<any>) {
        setState(this.store.selectSnapshot(RouterState.state));
      }
    }

    createTestModule({
      states: [TestState]
    });

    const router: Router = TestBed.get(Router);

    // Act
    await router.navigateByUrl('/testpath');

    // Assert
    const state = TestBed.get(Store).selectSnapshot(TestState);
    expect(state).toBeTruthy();
    expect(state.url).toEqual('/testpath');
  }));

  describe('RouterDataResolved', () => {
    function createRootElement() {
      const document = TestBed.get(DOCUMENT);
      const root = getDOM().createElement('app-root', document);
      getDOM().appendChild(document.body, root);
    }

    function removeRootElement() {
      const document = TestBed.get(DOCUMENT);
      const root = getDOM().querySelector(document, 'app-root');
      document.body.removeChild(root);
    }

    function destroyPlatformBeforeBootstrappingTheNewOne() {
      destroyPlatform();
      createRootElement();
    }

    // As we create our custom platform via `bootstrapModule`
    // we have to destroy it after assetions and revert
    // the previous one
    function resetPlatformAfterBootstrapping() {
      removeRootElement();
      destroyPlatform();
      createPlatform(TestBed);
    }

    function freshPlatform(fn: Function): (...args: any[]) => any {
      return async function testWithAFreshPlatform(this: any, ...args: any[]) {
        try {
          destroyPlatformBeforeBootstrappingTheNewOne();
          return await fn.apply(this, args);
        } finally {
          resetPlatformAfterBootstrapping();
        }
      };
    }

    const test = 'test-data';

    class TestResolver implements Resolve<string> {
      // Emulate micro-task
      async resolve(): Promise<string> {
        return test;
      }
    }

    @Component({
      selector: 'app-root',
      template: '<router-outlet></router-outlet>'
    })
    class RootComponent {}

    @Component({
      selector: 'test',
      template: '{{ router$ | async }}'
    })
    class TestComponent {
      @Select(RouterState.state)
      public router$: Observable<RouterStateModel>;
    }

    function getTestModule(states: any[] = []) {
      @NgModule({
        imports: [
          BrowserModule,
          // Resolvers are not respected if we're using `RouterTestingModule`
          // see https://github.com/angular/angular/issues/15779
          // to be sure our data is resolved - we have to use native `RouterModule`
          RouterModule.forRoot(
            [
              {
                path: '**',
                component: TestComponent,
                resolve: {
                  test: TestResolver
                }
              }
            ],
            { initialNavigation: 'enabled' }
          ),
          NgxsModule.forRoot(states),
          NgxsRouterPluginModule.forRoot()
        ],
        declarations: [RootComponent, TestComponent],
        bootstrap: [RootComponent],
        providers: [
          TestResolver,
          /**
           * Most routing applications should add a <base> element to the index.html as the first child
           * in the <head> tag to tell the router how to compose navigation URLs. If the app folder
           * is the application root, as it is for the sample application, set the href value
           * exactly as shown here: <base href="/">
           */
          { provide: APP_BASE_HREF, useValue: '/' }
        ]
      })
      class TestModule {}

      return TestModule;
    }

    it(
      'should wait for resolvers to complete and dispatch the `RouterDataResolved` event',
      freshPlatform(
        fakeAsync(async () => {
          // Arrange
          const { injector } = await platformBrowserDynamic().bootstrapModule(getTestModule());

          // Act
          const router: Router = injector.get(Router);
          const store: Store = injector.get(Store);

          // Assert
          const dataFromTheOriginalRouter = router.routerState.snapshot.root.firstChild!.data;
          expect(dataFromTheOriginalRouter).toEqual({ test });

          const dataFromTheRouterState = store.selectSnapshot(RouterState.state)!.root
            .firstChild!.data;
          expect(dataFromTheOriginalRouter).toEqual(dataFromTheRouterState);
        })
      )
    );

    it(
      'should keep resolved data if the navigation was performed between the same component but with params',
      freshPlatform(
        fakeAsync(async () => {
          // Arrange
          const { injector } = await platformBrowserDynamic().bootstrapModule(getTestModule());
          const router: Router = injector.get(Router);
          const store: Store = injector.get(Store);

          // Act
          await store
            .dispatch(
              new Navigate(
                ['/route2'],
                {
                  a: 10
                },
                {
                  queryParamsHandling: 'merge'
                }
              )
            )
            .toPromise();

          await store
            .dispatch(
              new Navigate(
                ['/route2'],
                {
                  b: 20
                },
                {
                  queryParamsHandling: 'merge'
                }
              )
            )
            .toPromise();

          // Assert
          const dataFromTheOriginalRouter = router.routerState.snapshot.root.firstChild!.data;
          expect(dataFromTheOriginalRouter).toEqual({ test });

          const dataFromTheRouterState = store.selectSnapshot(RouterState.state)!.root
            .firstChild!.data;
          expect(dataFromTheOriginalRouter).toEqual(dataFromTheRouterState);
        })
      )
    );

    it(
      'should dispatch `RouterDataResolved` action',
      freshPlatform(
        fakeAsync(async () => {
          // Arrange
          const { injector } = await platformBrowserDynamic().bootstrapModule(getTestModule());
          const actions$: Actions = injector.get(Actions);
          const store: Store = injector.get(Store);

          // Act

          // The very first `ResolveEnd` event is triggered during root module bootstrapping
          // `ofActionSuccessful(RouterDataResolved)` is asynchronous
          // and expectations are called right after `store.dispatch`
          // before the callback inside `actions$.subscribe(...)` is invoked
          const speciallyPromisedData = actions$
            .pipe(
              ofActionSuccessful(RouterDataResolved),
              first()
            )
            .toPromise()
            .then(({ routerState }: RouterDataResolved) => {
              return routerState!.root.firstChild!.data;
            });

          await store
            .dispatch(
              new Navigate(
                ['/route3'],
                {
                  a: 10
                },
                {
                  queryParamsHandling: 'merge'
                }
              )
            )
            .toPromise();

          // Assert
          const dataFromTheEvent = await speciallyPromisedData;
          expect(dataFromTheEvent).toEqual({ test });
        })
      )
    );

    it(
      'should update the state if navigation is performed between the same component',
      freshPlatform(
        fakeAsync(async () => {
          // Arrange
          @State({
            name: 'counter',
            defaults: 0
          })
          class CounterState {
            @Action(RouterNavigation)
            public routerNavigation({ getState, setState }: StateContext<number>): void {
              setState(getState() + 1);
            }
          }

          // Act
          const { injector } = await platformBrowserDynamic().bootstrapModule(
            getTestModule([CounterState])
          );
          const store: Store = injector.get(Store);
          const router: Router = injector.get(Router);

          await router.navigateByUrl('/a/b/c');
          await router.navigateByUrl('/a/b');

          // Assert
          const counter = store.selectSnapshot<number>(CounterState);
          expect(counter).toEqual(3);
        })
      )
    );

    it(
      'should call selector if navigation is performed between the same component',
      freshPlatform(
        fakeAsync(async () => {
          // Arrange
          let selectorCalledTimes = 0;

          @State({
            name: 'counter',
            defaults: 0
          })
          class CounterState {
            @Selector()
            public static counter(state: number) {
              selectorCalledTimes++;
              return state;
            }

            @Action(RouterNavigation)
            public routerNavigation({ getState, setState }: StateContext<number>): void {
              setState(getState() + 1);
            }
          }

          // Act
          const { injector } = await platformBrowserDynamic().bootstrapModule(
            getTestModule([CounterState])
          );
          const store: Store = injector.get(Store);
          const router: Router = injector.get(Router);

          const subscription = store.select(CounterState.counter).subscribe();

          await router.navigateByUrl('/a/b/c');
          await router.navigateByUrl('/a/b');
          subscription.unsubscribe();

          // Assert
          const counter = store.selectSnapshot(CounterState.counter);
          expect(selectorCalledTimes).toEqual(3);
          expect(selectorCalledTimes).toEqual(counter);
        })
      )
    );
  });
});

class TestAction {
  static type = '[Test] Test action';
}

function createTestModule(
  opts: {
    canActivate?: Function;
    canLoad?: Function;
    providers?: Provider[];
    states?: Type<any>[];
  } = {}
) {
  @Component({
    selector: 'test-app',
    template: '<router-outlet></router-outlet>'
  })
  class AppCmp {}

  @NgModule()
  class TestLazyModule {}

  @Component({
    selector: 'pagea-cmp',
    template: 'pagea-cmp'
  })
  class SimpleCmp {
    constructor(store: Store) {
      store.dispatch(new TestAction());
    }
  }

  TestBed.configureTestingModule({
    declarations: [AppCmp, SimpleCmp],
    imports: [
      NgxsModule.forRoot(opts.states || []),
      RouterTestingModule.withRoutes(
        [
          { path: '', component: SimpleCmp },
          {
            path: ':id',
            component: SimpleCmp,
            canActivate: ['CanActivateNext']
          },
          {
            path: 'load',
            loadChildren: () => TestLazyModule,
            canLoad: ['CanLoadNext']
          }
        ],
        {
          paramsInheritanceStrategy: 'always'
        }
      ),
      NgxsRouterPluginModule.forRoot()
    ],
    providers: [
      {
        provide: 'CanActivateNext',
        useValue: opts.canActivate || (() => true)
      },
      {
        provide: 'CanLoadNext',
        useValue: opts.canLoad || (() => true)
      },
      opts.providers || []
    ]
  });

  TestBed.createComponent(AppCmp);
}

function logOfRouterAndStore(router: Router, store: Store): any[] {
  const log: any[] = [];
  router.events.subscribe(e => {
    if (e.hasOwnProperty('url')) {
      log.push({
        type: 'router',
        event: e.constructor.name,
        url: (<any>e).url.toString()
      });
    }
  });
  store.select(RouterState.url).subscribe(state => log.push({ type: 'url', state }));
  return log;
}

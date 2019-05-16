import {
  Component,
  Provider,
  Type,
  NgModule,
  createPlatform,
  destroyPlatform
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
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
  it('should dispatch router state events', async () => {
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
  });

  it('should dispatch router state events for another route', async () => {
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
  });

  it('should select router state', async () => {
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
  });

  it('should handle Navigate action', async () => {
    // Arrange
    createTestModule();
    const store: Store = TestBed.get(Store);

    // Act
    await store.dispatch(new Navigate(['a-path'])).toPromise();

    // Assert
    const routerState = store.selectSnapshot(RouterState.state);
    expect(routerState!.url).toEqual('/a-path');
  });

  it('should select custom router state', async () => {
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
  });

  it('should dispatch `RouterNavigation` event if it was navigated to the same route with query params', async () => {
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
          ['/'],
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
          ['/'],
          {
            b: 20
          },
          {
            queryParamsHandling: 'merge'
          }
        )
      )
      .toPromise();

    store.selectOnce(RouterState.state).subscribe(routerState => {
      expect(routerState!.url).toEqual('/?a=10&b=20');
    });
  });

  it('should be possible to access the state snapshot if action is dispatched from the component constructor', async () => {
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
  });

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
        providers: [TestResolver]
      })
      class TestModule {}

      return TestModule;
    }

    it('should wait for resolvers to complete and dispatch the `RouterDataResolved` event', async () => {
      // Arrange
      destroyPlatformBeforeBootstrappingTheNewOne();

      // Act
      const { injector } = await platformBrowserDynamic().bootstrapModule(getTestModule());
      const router: Router = injector.get(Router);
      const store: Store = injector.get(Store);

      // Assert
      const dataFromTheOriginalRouter = router.routerState.snapshot.root.firstChild!.data;
      expect(dataFromTheOriginalRouter).toEqual({ test });

      const dataFromTheRouterState = store.selectSnapshot(RouterState.state)!.root.firstChild!
        .data;
      expect(dataFromTheOriginalRouter).toEqual(dataFromTheRouterState);

      resetPlatformAfterBootstrapping();
    });

    it('should keep resolved data if the navigation was performed between the same component but with params', async () => {
      // Arrange
      destroyPlatformBeforeBootstrappingTheNewOne();

      // Act
      const { injector } = await platformBrowserDynamic().bootstrapModule(getTestModule());
      const router: Router = injector.get(Router);
      const store: Store = injector.get(Store);

      await store
        .dispatch(
          new Navigate(
            ['/'],
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
            ['/'],
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

      const dataFromTheRouterState = store.selectSnapshot(RouterState.state)!.root.firstChild!
        .data;
      expect(dataFromTheOriginalRouter).toEqual(dataFromTheRouterState);

      resetPlatformAfterBootstrapping();
    });

    it('should dispatch `RouterDataResolved` action', async () => {
      // Arrange
      destroyPlatformBeforeBootstrappingTheNewOne();

      // Act
      const { injector } = await platformBrowserDynamic().bootstrapModule(getTestModule());
      const actions$: Actions = injector.get(Actions);
      const store: Store = injector.get(Store);

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
            ['/'],
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

      resetPlatformAfterBootstrapping();
    });

    it('should update the state if navigation is performed between the same component', async () => {
      // Arrange
      destroyPlatformBeforeBootstrappingTheNewOne();

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

      resetPlatformAfterBootstrapping();
    });

    it('should call selector if navigation is performed between the same component', async () => {
      // Arrange
      destroyPlatformBeforeBootstrappingTheNewOne();

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

      resetPlatformAfterBootstrapping();
    });
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
            loadChildren: 'test',
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

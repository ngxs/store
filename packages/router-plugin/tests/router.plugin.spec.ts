import { Component, Provider, Type, NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router, Params, RouterStateSnapshot } from '@angular/router';

import { take } from 'rxjs/operators';

import {
  NgxsModule,
  Store,
  Actions,
  ofActionSuccessful,
  State,
  Action,
  StateContext
} from '@ngxs/store';

import {
  NgxsRouterPluginModule,
  RouterState,
  RouterStateSerializer,
  Navigate,
  RouterNavigation
} from '../';

describe('NgxsRouterPlugin', () => {
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
        take(2)
      )
      .subscribe(() => {
        count++;
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
    expect(count).toBe(2);
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
      testAction(ctx: StateContext<unknown>) {
        ctx.setState(this.store.selectSnapshot(RouterState.state));
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
  class AppComponent {}

  @NgModule()
  class TestLazyModule {}

  @Component({
    selector: 'pagea-cmp',
    template: 'pagea-cmp'
  })
  class SimpleComponent {
    constructor(store: Store) {
      store.dispatch(new TestAction());
    }
  }

  TestBed.configureTestingModule({
    declarations: [AppComponent, SimpleComponent],
    imports: [
      NgxsModule.forRoot(opts.states || []),
      RouterTestingModule.withRoutes(
        [
          { path: '', component: SimpleComponent },
          {
            path: ':id',
            component: SimpleComponent,
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

  TestBed.createComponent(AppComponent);
}

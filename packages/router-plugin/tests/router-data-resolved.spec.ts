import { Component, NgModule } from '@angular/core';
import { APP_BASE_HREF } from '@angular/common';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { BrowserModule } from '@angular/platform-browser';
import { Router, RouterModule, Resolve } from '@angular/router';

import { Observable } from 'rxjs';
import { first } from 'rxjs/operators';

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
import { freshPlatform } from '@ngxs/store/internals/testing';

import {
  NgxsRouterPluginModule,
  RouterState,
  Navigate,
  RouterNavigation,
  RouterStateModel,
  RouterDataResolved
} from '../';

describe('RouterDataResolved', () => {
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
    @Select(RouterState.state) router$: Observable<RouterStateModel>;
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
      providers: [TestResolver, { provide: APP_BASE_HREF, useValue: '/' }]
    })
    class TestModule {}

    return TestModule;
  }

  it(
    'should wait for resolvers to complete and dispatch the `RouterDataResolved` event',
    freshPlatform(async () => {
      // Arrange
      const { injector } = await platformBrowserDynamic().bootstrapModule(getTestModule());

      // Act
      const router: Router = injector.get(Router);
      const store: Store = injector.get(Store);

      // Assert
      const dataFromTheOriginalRouter = router.routerState.snapshot.root.firstChild!.data;
      expect(dataFromTheOriginalRouter).toEqual({ test });

      const dataFromTheRouterState = store.selectSnapshot(RouterState.state)!.root.firstChild!
        .data;
      expect(dataFromTheOriginalRouter).toEqual(dataFromTheRouterState);
    })
  );

  it(
    'should keep resolved data if the navigation was performed between the same component but with params',
    freshPlatform(async () => {
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

      const dataFromTheRouterState = store.selectSnapshot(RouterState.state)!.root.firstChild!
        .data;
      expect(dataFromTheOriginalRouter).toEqual(dataFromTheRouterState);
    })
  );

  it(
    'should dispatch `RouterDataResolved` action',
    freshPlatform(async () => {
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
  );

  it(
    'should update the state if navigation is performed between the same component',
    freshPlatform(async () => {
      // Arrange
      @State({
        name: 'counter',
        defaults: 0
      })
      class CounterState {
        @Action(RouterNavigation)
        routerNavigation(ctx: StateContext<number>): void {
          ctx.setState(ctx.getState() + 1);
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
  );

  it(
    'should call selector if navigation is performed between the same component',
    freshPlatform(async () => {
      // Arrange
      let selectorCalledTimes = 0;

      @State({
        name: 'counter',
        defaults: 0
      })
      class CounterState {
        @Selector()
        static counter(state: number) {
          selectorCalledTimes++;
          return state;
        }

        @Action(RouterNavigation)
        routerNavigation(ctx: StateContext<number>): void {
          ctx.setState(ctx.getState() + 1);
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
  );
});

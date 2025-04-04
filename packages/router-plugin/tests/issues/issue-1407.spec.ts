import { RouterTestingModule } from '@angular/router/testing';
import { APP_BASE_HREF, DOCUMENT } from '@angular/common';
import { Component, Injectable, NgModule } from '@angular/core';
import { Routes } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import {
  State,
  Action,
  StateContext,
  provideStore,
  provideStates,
  DispatchOutsideZoneNgxsExecutionStrategy
} from '@ngxs/store';
import { ɵStateClass } from '@ngxs/store/internals';
import { freshPlatform } from '@ngxs/store/internals/testing';

import { Navigate, RouterNavigation, RouterState, withNgxsRouterPlugin } from '../..';

import { createNgxsRouterPluginTestingPlatform } from '../helpers';

@Component({
  selector: 'app-root',
  template: '<router-outlet></router-outlet>',
  standalone: false
})
class RootComponent {}

@Component({
  selector: 'app-home',
  template: 'Home page',
  standalone: false
})
class HomeComponent {}

@Component({
  selector: 'app-dialed-number',
  template: 'Dialed number page',
  standalone: false
})
class DialedNumberComponent {}

const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'dialed-number',
    component: DialedNumberComponent
  }
];

function getTestModule(states: ɵStateClass[] = []) {
  @NgModule({
    imports: [BrowserModule, RouterTestingModule.withRoutes(routes, { enableTracing: true })],
    declarations: [RootComponent, HomeComponent, DialedNumberComponent],
    bootstrap: [RootComponent],
    providers: [
      provideStore(
        [],
        {
          executionStrategy: DispatchOutsideZoneNgxsExecutionStrategy
        },
        withNgxsRouterPlugin()
      ),
      provideStates(states),
      { provide: APP_BASE_HREF, useValue: '/' }
    ]
  })
  class TestModule {}

  return TestModule;
}

// See https://github.com/ngxs/store/issues/1407
describe('#1407 issue', () => {
  it(
    'should successfully navigate in the "RouterNavigation" action handler',
    freshPlatform(async () => {
      // Arrange
      let navigateDispatchedTimes = 0;

      @State({
        name: 'queryParams'
      })
      @Injectable()
      class QueryParamsState {
        @Action(RouterNavigation)
        handleQueryParams(ctx: StateContext<unknown>, action: RouterNavigation) {
          const queryParams = action.routerState.root.queryParams;
          const dialedNumber = queryParams.dialedNumber;

          if (dialedNumber) {
            navigateDispatchedTimes++;
            const [url] = action.routerState.url.split('?');
            return ctx.dispatch(new Navigate([url]));
          }
          return;
        }
      }

      // Act
      const { router, store, injector, ngZone } = await createNgxsRouterPluginTestingPlatform(
        getTestModule([QueryParamsState])
      );

      await ngZone.run(() => router.navigateByUrl('/dialed-number?dialedNumber=5555555'));

      const document = injector.get(DOCUMENT);
      const root = document.querySelector('app-root')!;
      const routerState = store.selectSnapshot(RouterState.state());

      // Assert
      expect(navigateDispatchedTimes).toBe(1);
      expect(routerState).toBeDefined();
      expect(router.url).toBe('/dialed-number');
      expect(routerState!.url).toBe(router.url);
      expect(root.innerHTML).toContain(
        '<app-dialed-number>Dialed number page</app-dialed-number>'
      );
    })
  );
});

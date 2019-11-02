import { RouterTestingModule } from '@angular/router/testing';
import { APP_BASE_HREF } from '@angular/common';
import { Component, NgModule } from '@angular/core';
import { Routes } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { NgxsModule, Store, State, Action, StateContext } from '@ngxs/store';
import { freshPlatform } from '@ngxs/store/internals/testing';

import { NgxsRouterPluginModule, Navigate, RouterNavigation } from '../../';

import { createNgxsRouterPluginTestingPlatform } from '../helpers';
import { StateClass } from '@ngxs/store/internals';

@Component({
  selector: 'app-root',
  template: '<router-outlet></router-outlet>'
})
class RootComponent {}

@Component({
  selector: 'app-home',
  template: 'Home page'
})
class HomeComponent {}

@Component({
  selector: 'app-dialed-number',
  template: 'Dialed number page'
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

function getTestModule(states: StateClass[] = []) {
  @NgModule({
    imports: [
      BrowserModule,
      RouterTestingModule.withRoutes(routes),
      NgxsModule.forRoot(states),
      NgxsRouterPluginModule.forRoot()
    ],
    declarations: [RootComponent, HomeComponent, DialedNumberComponent],
    bootstrap: [RootComponent],
    providers: [{ provide: APP_BASE_HREF, useValue: '/' }]
  })
  class TestModule {}

  return TestModule;
}

// See https://github.com/ngxs/store/issues/1407
describe('#1407 issue', () => {
  xit(
    'should successfully navigate in the "RouterNavigation" action handler',
    freshPlatform(async () => {
      // Arrange
      let actionHandlerInvokedTimes = 0;

      @State({ name: 'queryParams' })
      class QueryParamsState {
        @Action(RouterNavigation)
        handleQueryParams(ctx: StateContext<unknown>, action: RouterNavigation) {
          actionHandlerInvokedTimes++;
          const queryParams = action.routerState.root.queryParams;
          const dialedNumber = queryParams.dialedNumber;
          if (dialedNumber) {
            const [url] = action.routerState.url.split('?');
            return ctx.dispatch(new Navigate([url]));
          }
        }
      }

      const { router } = await createNgxsRouterPluginTestingPlatform(
        getTestModule([QueryParamsState])
      );

      await router.navigateByUrl('/dialed-number?dialedNumber=5555555');
    })
  );
});

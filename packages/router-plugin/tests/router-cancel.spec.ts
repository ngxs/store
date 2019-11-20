import { RouterTestingModule } from '@angular/router/testing';
import { APP_BASE_HREF } from '@angular/common';
import { Component, NgModule, Injectable } from '@angular/core';
import { Routes, CanDeactivate, NavigationCancel } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { NgxsModule } from '@ngxs/store';
import { freshPlatform } from '@ngxs/store/internals/testing';

import { filter } from 'rxjs/operators';

import { RouterState, NgxsRouterPluginModule } from '../';

import { createNgxsRouterPluginTestingPlatform } from './helpers';

@Component({
  selector: 'app-root',
  template: '<router-outlet></router-outlet>'
})
class RootComponent {}

@Component({
  selector: 'app-home',
  template: ''
})
class HomeComponent {}

@Component({
  selector: 'app-blog',
  template: ''
})
class BlogComponent {}

@Injectable()
class HomeGuard implements CanDeactivate<HomeComponent> {
  async canDeactivate() {
    return false;
  }
}

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    canDeactivate: [HomeGuard]
  },
  {
    path: 'blog',
    component: BlogComponent
  }
];

function getTestModule() {
  @NgModule({
    imports: [
      BrowserModule,
      RouterTestingModule.withRoutes(routes, { initialNavigation: 'enabled' }),
      NgxsModule.forRoot(),
      NgxsRouterPluginModule.forRoot()
    ],
    declarations: [RootComponent, HomeComponent, BlogComponent],
    bootstrap: [RootComponent],
    providers: [HomeGuard, { provide: APP_BASE_HREF, useValue: '/' }]
  })
  class TestModule {}

  return TestModule;
}

describe('RouterCancel', () => {
  it(
    'should persist the previous state if the "RouterCancel" action is dispatched',
    freshPlatform(async () => {
      // Arrange
      const { router, store } = await createNgxsRouterPluginTestingPlatform(getTestModule());

      let navigationCancelEmittedTimes = 0;

      // Act
      const subscription = router.events
        .pipe(filter((event): event is NavigationCancel => event instanceof NavigationCancel))
        .subscribe(() => {
          navigationCancelEmittedTimes++;
        });

      await router.navigateByUrl('/');
      await router.navigateByUrl('/blog');

      const url = store.selectSnapshot(RouterState.url);

      subscription.unsubscribe();

      // Assert
      expect(url).toBe('/');
      expect(navigationCancelEmittedTimes).toBe(1);
    })
  );
});

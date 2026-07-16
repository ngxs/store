import { Component, NgModule } from '@angular/core';
import { APP_BASE_HREF } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { provideStore } from '@ngxs/store';
import { freshPlatform } from '@ngxs/store/internals/testing';

import { createNgxsRouterPluginTestingPlatform } from './helpers';
import { RouterState, withNgxsRouterPlugin } from '../';

describe('RouterState derived selectors', () => {
  @Component({
    selector: 'app-root',
    template: '<router-outlet></router-outlet>',
    standalone: false
  })
  class RootComponent {}

  @Component({ selector: 'home', template: '', standalone: false })
  class HomeComponent {}

  @Component({
    selector: 'parent',
    template: '<router-outlet></router-outlet>',
    standalone: false
  })
  class ParentComponent {}

  @Component({ selector: 'child', template: '', standalone: false })
  class ChildComponent {}

  function getTestModule() {
    @NgModule({
      imports: [
        BrowserModule,
        RouterModule.forRoot([
          { path: '', component: HomeComponent },
          {
            path: 'parent/:parentId',
            component: ParentComponent,
            data: { section: 'parent' },
            children: [
              {
                path: 'child/:childId',
                component: ChildComponent,
                data: { section: 'child' },
                title: 'Child Title'
              }
            ]
          }
        ])
      ],
      declarations: [RootComponent, HomeComponent, ParentComponent, ChildComponent],
      bootstrap: [RootComponent],
      providers: [
        provideStore([], withNgxsRouterPlugin()),
        { provide: APP_BASE_HREF, useValue: '/' }
      ]
    })
    class TestModule {}
    return TestModule;
  }

  it(
    'should derive queryParams, fragment, params, data and title from the deepest activated route',
    freshPlatform(async () => {
      // Arrange
      const { router, store, ngZone } =
        await createNgxsRouterPluginTestingPlatform(getTestModule());

      // Act
      await ngZone.run(() => router.navigateByUrl('/parent/1/child/2?foo=bar#frag'));

      // Assert
      expect(store.selectSnapshot(RouterState.queryParams)).toEqual({ foo: 'bar' });
      expect(store.selectSnapshot(RouterState.fragment)).toBe('frag');

      // `params`/`data`/`title` reflect the *leaf* route (`child/:childId`),
      // not the parent (`parent/:parentId`) — matches how
      // `ActivatedRoute.snapshot` behaves by default (no params inheritance).
      expect(store.selectSnapshot(RouterState.params)).toEqual({ childId: '2' });
      // Angular stashes the resolved title in `data` under a `Symbol(RouteTitle)`
      // key when a route `title` is configured, so `data` contains more than
      // just what we declared — assert our own key rather than exact equality.
      expect(store.selectSnapshot(RouterState.data)).toEqual(
        expect.objectContaining({ section: 'child' })
      );
      expect(store.selectSnapshot(RouterState.title)).toBe('Child Title');
    })
  );

  it(
    'should update derived selectors on subsequent navigations',
    freshPlatform(async () => {
      // Arrange
      const { router, store, ngZone } =
        await createNgxsRouterPluginTestingPlatform(getTestModule());
      await ngZone.run(() => router.navigateByUrl('/parent/1/child/2?foo=bar'));

      // Act
      await ngZone.run(() => router.navigateByUrl('/parent/3/child/4?foo=baz'));

      // Assert
      expect(store.selectSnapshot(RouterState.queryParams)).toEqual({ foo: 'baz' });
      expect(store.selectSnapshot(RouterState.params)).toEqual({ childId: '4' });
    })
  );
});

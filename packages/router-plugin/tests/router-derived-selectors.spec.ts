import { Component, NgModule } from '@angular/core';
import { APP_BASE_HREF } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { provideStore } from '@ngxs/store';
import { freshPlatform } from '@ngxs/store/internals/testing';

import { createNgxsRouterPluginTestingPlatform } from './helpers';
import {
  routerData,
  routerDataForOutlet,
  routerFragment,
  routerParams,
  routerParamsForOutlet,
  routerQueryParams,
  routerTitle,
  routerTitleForOutlet,
  withNgxsRouterPlugin
} from '../';

describe('RouterState derived selectors', () => {
  @Component({
    selector: 'app-root',
    template: '<router-outlet></router-outlet><router-outlet name="aux"></router-outlet>',
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

  @Component({ selector: 'aux', template: '', standalone: false })
  class AuxComponent {}

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
          },
          {
            path: 'aux/:auxId',
            component: AuxComponent,
            outlet: 'aux',
            data: { section: 'aux' },
            title: 'Aux Title'
          }
        ])
      ],
      declarations: [
        RootComponent,
        HomeComponent,
        ParentComponent,
        ChildComponent,
        AuxComponent
      ],
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
      expect(store.selectSnapshot(routerQueryParams)).toEqual({ foo: 'bar' });
      expect(store.selectSnapshot(routerFragment)).toBe('frag');

      // `params`/`data`/`title` reflect the *leaf* route (`child/:childId`),
      // not the parent (`parent/:parentId`) — matches how
      // `ActivatedRoute.snapshot` behaves by default (no params inheritance).
      expect(store.selectSnapshot(routerParams)).toEqual({ childId: '2' });
      // Angular stashes the resolved title in `data` under a `Symbol(RouteTitle)`
      // key when a route `title` is configured, so `data` contains more than
      // just what we declared — assert our own key rather than exact equality.
      expect(store.selectSnapshot(routerData)).toEqual(
        expect.objectContaining({ section: 'child' })
      );
      expect(store.selectSnapshot(routerTitle)).toBe('Child Title');
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
      expect(store.selectSnapshot(routerQueryParams)).toEqual({ foo: 'baz' });
      expect(store.selectSnapshot(routerParams)).toEqual({ childId: '4' });
    })
  );

  it(
    'should derive params, data and title for a named outlet independently of the primary outlet',
    freshPlatform(async () => {
      // Arrange
      const { router, store, ngZone } =
        await createNgxsRouterPluginTestingPlatform(getTestModule());

      // Act — activate the primary outlet and the `aux` outlet at the same time.
      await ngZone.run(() =>
        router.navigate([
          { outlets: { primary: ['parent', '1', 'child', '2'], aux: ['aux', '9'] } }
        ])
      );

      // Assert — the primary-outlet selectors are unaffected by the aux outlet.
      expect(store.selectSnapshot(routerParams)).toEqual({ childId: '2' });
      expect(store.selectSnapshot(routerData)).toEqual(
        expect.objectContaining({ section: 'child' })
      );
      expect(store.selectSnapshot(routerTitle)).toBe('Child Title');

      // Assert — the `aux` outlet's own branch is resolved independently.
      expect(store.selectSnapshot(routerParamsForOutlet('aux'))).toEqual({ auxId: '9' });
      expect(store.selectSnapshot(routerDataForOutlet('aux'))).toEqual(
        expect.objectContaining({ section: 'aux' })
      );
      expect(store.selectSnapshot(routerTitleForOutlet('aux'))).toBe('Aux Title');
    })
  );
});

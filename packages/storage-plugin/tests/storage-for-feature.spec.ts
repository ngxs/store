import { bootstrapApplication } from '@angular/platform-browser';
import { APP_BASE_HREF } from '@angular/common';
import { ApplicationConfig, Component, Injectable, NgZone } from '@angular/core';
import {
  Router,
  RouterOutlet,
  provideRouter,
  withDisabledInitialNavigation
} from '@angular/router';

import { State, Store, provideStates, provideStore } from '@ngxs/store';
import { freshPlatform, skipConsoleLogging } from '@ngxs/store/internals/testing';

import { NgxsStoragePluginOptions, withNgxsStoragePlugin, withStorageFeature } from '..';

describe('forFeature', () => {
  interface CounterStateModel {
    count: number;
  }

  @State<CounterStateModel>({
    name: 'counter',
    defaults: { count: 0 }
  })
  @Injectable()
  class CounterState {}

  interface BlogStateModel {
    pages: number[];
  }

  @State<BlogStateModel>({
    name: 'blog',
    defaults: { pages: [] }
  })
  @Injectable()
  class BlogState {}

  @Component({ selector: 'app-blog', template: 'This is blog', standalone: true })
  class BlogComponent {}

  @Component({
    selector: 'app-root',
    template: '<router-outlet></router-outlet>',
    standalone: true,
    imports: [RouterOutlet]
  })
  class TestComponent {}

  const setupAppConfig = (options: NgxsStoragePluginOptions) => {
    const appConfig: ApplicationConfig = {
      providers: [
        { provide: APP_BASE_HREF, useValue: '/' },

        provideRouter(
          [
            {
              path: 'blog',
              loadComponent: () => BlogComponent,
              providers: [provideStates([BlogState], withStorageFeature([BlogState]))]
            }
          ],
          withDisabledInitialNavigation()
        ),

        provideStore([CounterState], withNgxsStoragePlugin(options))
      ]
    };

    return appConfig;
  };

  it(
    'should de-serialize the state when provided through forFeature',
    freshPlatform(async () => {
      // Arrange
      localStorage.setItem('counter', JSON.stringify({ counter: { count: 100 } }));
      localStorage.setItem('blog', JSON.stringify({ pages: [1, 2, 3] }));

      const appConfig = setupAppConfig({
        keys: [CounterState]
      });

      const { injector } = await skipConsoleLogging(() =>
        bootstrapApplication(TestComponent, appConfig)
      );
      const router = injector.get(Router);
      const ngZone = injector.get(NgZone);
      const store = injector.get(Store);
      // Act
      await ngZone.run(() => router.navigateByUrl('/blog'));
      // Assert
      expect(store.snapshot().blog).toEqual({ pages: [1, 2, 3] });
    })
  );

  it(
    'should log an error if the `keys` property is set to `*`',
    freshPlatform(async () => {
      // Arrange
      const spy = jest.spyOn(console, 'error');

      const appConfig = setupAppConfig({
        keys: '*'
      });

      const { injector } = await bootstrapApplication(TestComponent, appConfig);
      const router = injector.get(Router);
      const ngZone = injector.get(NgZone);

      // Act
      await ngZone.run(() => router.navigateByUrl('/blog'));

      try {
        expect(spy).toHaveBeenCalledWith(
          expect.stringMatching(/The NGXS storage plugin is currently persisting all states/)
        );
      } finally {
        spy.mockRestore();
      }
    })
  );
});

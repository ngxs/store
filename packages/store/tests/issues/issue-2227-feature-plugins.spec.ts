import { ChangeDetectionStrategy, Component, Injectable } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import {
  provideRouter,
  Router,
  RouterOutlet,
  Routes,
  withEnabledBlockingInitialNavigation
} from '@angular/router';
import {
  provideStates,
  provideStore,
  withNgxsPlugin,
  Store,
  DispatchOutsideZoneNgxsExecutionStrategy
} from '@ngxs/store';
import { getActionTypeFromInstance, NgxsNextPluginFn, NgxsPlugin } from '@ngxs/store/plugins';
import { freshPlatform, skipConsoleLogging } from '@ngxs/store/internals/testing';

describe('Feature plugin initialization (https://github.com/ngxs/store/issues/2227)', () => {
  const recorder: string[] = [];

  @Component({
    selector: 'app-root',
    template: '<router-outlet />',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [RouterOutlet]
  })
  class TestComponent {}

  @Component({
    selector: 'app-child',
    template: '',
    standalone: true
  })
  class ChildComponent {}

  @Injectable()
  class ChildPlugin implements NgxsPlugin {
    constructor() {
      recorder.push('ChildPlugin constructor');
    }

    handle(state: any, action: any, next: NgxsNextPluginFn) {
      recorder.push(`action dispatched: ${getActionTypeFromInstance(action)}`);
      return next(state, action);
    }
  }

  const routes: Routes = [
    {
      path: 'child',
      loadComponent: async () => ChildComponent,
      providers: [provideStates([], withNgxsPlugin(ChildPlugin))]
    }
  ];

  const appConfig = {
    providers: [
      provideRouter(routes, withEnabledBlockingInitialNavigation()),
      provideStore([], {
        executionStrategy: DispatchOutsideZoneNgxsExecutionStrategy
      })
    ]
  };

  it(
    'should navigate to a child route and initializa the feature plugin',
    freshPlatform(async () => {
      // Arrange
      const { injector } = await skipConsoleLogging(() =>
        bootstrapApplication(TestComponent, appConfig)
      );
      const router = injector.get(Router);
      const store = injector.get(Store);

      // Act
      await router.navigateByUrl('/child');
      store.dispatch({ type: 'random_action' });

      // Assert
      expect(recorder).toEqual([
        'ChildPlugin constructor',
        'action dispatched: random_action'
      ]);
    })
  );
});

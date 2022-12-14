import { APP_INITIALIZER, Component, Injectable, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import {
  Actions,
  NgxsModule,
  State,
  ofActionCompleted,
  UpdateState,
  Store
} from '@ngxs/store';
import { freshPlatform, skipConsoleLogging } from '@ngxs/store/internals/testing';

import { NgxsStoragePluginModule } from '../../';
import { DEFAULT_STATE_KEY } from '../../src/internals';

describe('Update for lazy state (https://github.com/ngxs/store/issues/1857)', () => {
  afterEach(() => localStorage.clear());

  @Injectable({ providedIn: 'root' })
  class ActionsListener {
    snapshot: any;

    constructor(store: Store, actions: Actions) {
      actions
        .pipe(ofActionCompleted(UpdateState))
        .subscribe(() => (this.snapshot = store.snapshot()));
    }
  }

  @State({
    name: 'feature'
  })
  class FeatureState {}

  @NgModule({
    imports: [NgxsModule.forFeature([FeatureState])],
    providers: [
      {
        provide: APP_INITIALIZER,
        useFactory: () => () => {},
        deps: [ActionsListener],
        multi: true
      }
    ]
  })
  class FeatureStateModule {}

  @Component({ selector: 'app-root', template: '' })
  class TestComponent {}

  @NgModule({
    imports: [
      BrowserModule,
      NgxsModule.forRoot([]),
      NgxsStoragePluginModule.forRoot(),
      FeatureStateModule
    ],
    declarations: [TestComponent],
    bootstrap: [TestComponent]
  })
  class TestModule {}

  it(
    'should deserialize the feature state if the key is a master key (@@STATE)',
    freshPlatform(async () => {
      // Arrange & act
      localStorage.setItem(DEFAULT_STATE_KEY, JSON.stringify({ feature: { name: 'NGXS' } }));
      const { injector } = await skipConsoleLogging(() =>
        platformBrowserDynamic().bootstrapModule(TestModule)
      );
      const listener = injector.get(ActionsListener);
      // Assert
      expect(listener.snapshot).toEqual({
        feature: { name: 'NGXS' }
      });
    })
  );
});

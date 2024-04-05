import { APP_INITIALIZER, Component, Injectable, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { NgxsModule, State, Store } from '@ngxs/store';
import { freshPlatform, skipConsoleLogging } from '@ngxs/store/internals/testing';
import { ɵDEFAULT_STATE_KEY } from '@ngxs/storage-plugin/internals';

import { NgxsStoragePluginModule } from '../../';

describe('Update for lazy state (https://github.com/ngxs/store/issues/1857)', () => {
  afterEach(() => localStorage.clear());

  @Injectable({ providedIn: 'root' })
  class ActionsListener {
    snapshot: any;

    constructor(store: Store) {
      this.snapshot = store.snapshot();
    }
  }

  @State({
    name: 'feature'
  })
  @Injectable()
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
      NgxsStoragePluginModule.forRoot({ keys: '*' }),
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
      localStorage.setItem(ɵDEFAULT_STATE_KEY, JSON.stringify({ feature: { name: 'NGXS' } }));
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

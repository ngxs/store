import { Component, Injectable, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { NgxsModule, State, Store } from '@ngxs/store';
import { freshPlatform, skipConsoleLogging } from '@ngxs/store/internals/testing';

import { LOCAL_STORAGE_ENGINE, NgxsStoragePluginModule, SESSION_STORAGE_ENGINE } from '../../';

describe('Storage engine per individual key (https://github.com/ngxs/store/issues/598)', () => {
  @State({
    name: 'blog',
    defaults: {
      name: null
    }
  })
  @Injectable()
  class BlogState {}

  @State({
    name: 'home',
    defaults: {
      name: null
    }
  })
  @Injectable()
  class HomeState {}

  @State({
    name: 'encrypted',
    defaults: {
      names: []
    }
  })
  @Injectable()
  class EncryptedState {}

  @Component({ selector: 'app-root', template: '' })
  class TestComponent {}

  @Injectable({ providedIn: 'root' })
  class EncryptedStorageEngine {
    getItem(key: string) {
      const val = localStorage.getItem(key);
      return typeof val === 'string' ? atob(val) : null;
    }

    setItem(key: string, val: any) {
      localStorage.setItem(key, btoa(val));
    }
  }

  @NgModule({
    imports: [
      BrowserModule,
      NgxsModule.forRoot([BlogState, HomeState, EncryptedState]),
      NgxsStoragePluginModule.forRoot({
        keys: [
          {
            key: 'blog.name',
            engine: SESSION_STORAGE_ENGINE
          },
          {
            key: HomeState,
            engine: LOCAL_STORAGE_ENGINE
          },
          {
            key: 'encrypted',
            engine: EncryptedStorageEngine
          }
        ]
      })
    ],
    declarations: [TestComponent],
    bootstrap: [TestComponent]
  })
  class TestModule {}

  it(
    'should deserialize states using the individual engine provided per key',
    freshPlatform(async () => {
      // Arrange
      sessionStorage.setItem('blog.name', JSON.stringify('Artur'));
      localStorage.setItem('home', JSON.stringify({ name: 'Mark' }));
      localStorage.setItem('encrypted', btoa(JSON.stringify(['Artur', 'Mark'])));
      const { injector } = await skipConsoleLogging(() =>
        platformBrowserDynamic().bootstrapModule(TestModule)
      );
      const store = injector.get(Store);
      // Assert
      expect(store.snapshot()).toEqual({
        blog: { name: 'Artur' },
        home: { name: 'Mark' },
        encrypted: ['Artur', 'Mark']
      });
    })
  );
});

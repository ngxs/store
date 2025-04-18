import { Component, Injectable, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import {
  DispatchOutsideZoneNgxsExecutionStrategy,
  NgxsModule,
  State,
  Store
} from '@ngxs/store';
import { freshPlatform, skipConsoleLogging } from '@ngxs/store/internals/testing';

import { NgxsStoragePluginModule } from '../../';

describe('State deserialization for keys with dot notation (https://github.com/ngxs/store/issues/1916)', () => {
  afterEach(() => localStorage.clear());

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
    name: 'about',
    defaults: {
      description: null
    }
  })
  @Injectable()
  class AboutState {}

  @Component({ selector: 'app-root', template: '', standalone: false })
  class TestComponent {}

  @NgModule({
    imports: [
      BrowserModule,
      NgxsModule.forRoot([BlogState, HomeState, AboutState], {
        executionStrategy: DispatchOutsideZoneNgxsExecutionStrategy
      }),
      NgxsStoragePluginModule.forRoot({
        keys: ['blog.name', HomeState, 'about.description']
      })
    ],
    declarations: [TestComponent],
    bootstrap: [TestComponent]
  })
  class TestModule {}

  it(
    'should deserialize states from the storage when keys are provided with dot notation',
    freshPlatform(async () => {
      // Arrange
      localStorage.setItem('blog.name', JSON.stringify('Artur'));
      localStorage.setItem('home', JSON.stringify({ name: 'Mark' }));
      localStorage.setItem(
        'about.description',
        JSON.stringify('This is some cool description')
      );
      const { injector } = await skipConsoleLogging(() =>
        platformBrowserDynamic().bootstrapModule(TestModule)
      );
      const store = injector.get(Store);
      // Assert
      expect(store.snapshot()).toEqual({
        blog: { name: 'Artur' },
        home: { name: 'Mark' },
        about: { description: 'This is some cool description' }
      });
    })
  );
});

import { Component, Injectable, InjectionToken, NgModule, inject } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { NgxsModule, State, Store } from '@ngxs/store';
import { freshPlatform, skipConsoleLogging } from '@ngxs/store/internals/testing';
import { ɵisEngineFactory } from '@ngxs/storage-plugin/internals';

import { NgxsStoragePluginModule, StorageEngine } from '../';

describe('Engine factory function in KeyWithExplicitEngine', () => {
  class InMemoryStorage implements StorageEngine {
    private readonly store = new Map<string, any>();
    getItem(key: string) {
      return this.store.get(key) ?? null;
    }
    setItem(key: string, value: any) {
      this.store.set(key, value);
    }
  }

  @State({ name: 'blog', defaults: { name: null } })
  @Injectable()
  class BlogState {}

  @Component({ selector: 'app-root', template: '', standalone: false })
  class TestComponent {}

  describe('ɵisEngineFactory', () => {
    it('should return false for a class constructor', () => {
      class MyEngine implements StorageEngine {
        getItem(_key: string) {
          return null;
        }
        setItem(_key: string, _value: any) {}
      }
      expect(ɵisEngineFactory(MyEngine)).toBe(false);
    });

    it('should return false for an InjectionToken', () => {
      const token = new InjectionToken<StorageEngine>('test');
      expect(ɵisEngineFactory(token)).toBe(false);
    });

    it('should return true for an arrow function', () => {
      const storage = new InMemoryStorage();
      expect(ɵisEngineFactory(() => storage)).toBe(true);
    });

    it('should return true for a regular function', () => {
      const storage = new InMemoryStorage();
      expect(
        ɵisEngineFactory(function () {
          return storage;
        })
      ).toBe(true);
    });
  });

  it(
    'should use the engine instance returned by a factory function',
    freshPlatform(async () => {
      // Arrange
      const storage = new InMemoryStorage();
      storage.setItem('blog', JSON.stringify({ name: 'Artur' }));

      @NgModule({
        imports: [
          BrowserModule,
          NgxsModule.forRoot([BlogState]),
          NgxsStoragePluginModule.forRoot({
            keys: [{ key: 'blog', engine: () => storage }]
          })
        ],
        declarations: [TestComponent],
        bootstrap: [TestComponent]
      })
      class TestModule {}

      const { injector } = await skipConsoleLogging(() =>
        platformBrowserDynamic().bootstrapModule(TestModule)
      );

      // Assert
      expect(injector.get(Store).snapshot()).toEqual({ blog: { name: 'Artur' } });
    })
  );

  it(
    'should allow inject() to be called inside the factory function',
    freshPlatform(async () => {
      // Arrange
      const storage = new InMemoryStorage();
      storage.setItem('blog', JSON.stringify({ name: 'Mark' }));

      const BLOG_STORAGE = new InjectionToken<StorageEngine>('BLOG_STORAGE', {
        providedIn: 'root',
        factory: () => storage
      });

      @NgModule({
        imports: [
          BrowserModule,
          NgxsModule.forRoot([BlogState]),
          NgxsStoragePluginModule.forRoot({
            keys: [{ key: 'blog', engine: () => inject(BLOG_STORAGE) }]
          })
        ],
        declarations: [TestComponent],
        bootstrap: [TestComponent]
      })
      class TestModule {}

      const { injector } = await skipConsoleLogging(() =>
        platformBrowserDynamic().bootstrapModule(TestModule)
      );

      // Assert — verifies runInInjectionContext wires inject() correctly
      expect(injector.get(Store).snapshot()).toEqual({ blog: { name: 'Mark' } });
    })
  );
});

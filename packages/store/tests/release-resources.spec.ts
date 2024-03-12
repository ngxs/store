import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ErrorHandler, DoBootstrap } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { NgxsModule, Store } from '@ngxs/store';
import { freshPlatform } from '@ngxs/store/internals/testing';

import { NoopErrorHandler } from './helpers/utils';
import { SelectFactory } from '../src/decorators/select/select-factory';

describe('Release NGXS resources', () => {
  it(
    'should invoke ngOnDestroy() on the SelectFactory and properties should become null',
    freshPlatform(async () => {
      // Arrange
      @NgModule({
        imports: [BrowserModule, NgxsModule.forRoot([])],
        providers: [{ provide: ErrorHandler, useClass: NoopErrorHandler }]
      })
      class TestModule implements DoBootstrap {
        ngDoBootstrap(): void {}
      }

      // Act
      const ngModuleRef = await platformBrowserDynamic().bootstrapModule(TestModule);

      const onDestroyFn = jest.fn();
      ngModuleRef.onDestroy(onDestroyFn);

      // Assert
      expect(SelectFactory.store).toBeInstanceOf(Store);
      expect(SelectFactory.config!.compatibility).toEqual({
        strictContentSecurityPolicy: false
      });

      ngModuleRef.destroy();

      expect(onDestroyFn).toHaveBeenCalled();
      expect(SelectFactory.store).toEqual(null);
      expect(SelectFactory.config).toEqual(null);
    })
  );
});

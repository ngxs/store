import {
  EnvironmentProviders,
  ModuleWithProviders,
  NgModule,
  inject,
  provideEnvironmentInitializer
} from '@angular/core';

import { SelectFactory } from './select-factory';

/**
 * Turns on the deprecated `@Select` decorator.
 *
 * `@Select` grabs the store from a static on `SelectFactory` - it has no
 * injection context of its own. On the server that static hangs around between
 * requests and pins the whole state tree, so NGXS doesn't create it for you
 * anymore. Add this only if you still use `@Select`.
 *
 * ```ts
 * provideStore([CountriesState], withNgxsSelectDecoratorSupport());
 * ```
 *
 * @deprecated `@Select` is deprecated - move to `store.select()`, the functional
 * `select()`, or `store.selectSignal()`:
 * https://ngxs.io/deprecations/select-decorator-deprecation
 */
export function withNgxsSelectDecoratorSupport(): EnvironmentProviders {
  return provideEnvironmentInitializer(() => inject(SelectFactory));
}

/**
 * `NgModule` version of `withNgxsSelectDecoratorSupport()`, for apps still on
 * `NgxsModule.forRoot()`.
 *
 * ```ts
 * @NgModule({
 *   imports: [
 *     NgxsModule.forRoot([CountriesState]),
 *     NgxsSelectDecoratorSupportModule.forRoot()
 *   ]
 * })
 * export class AppModule {}
 * ```
 *
 * @deprecated See `withNgxsSelectDecoratorSupport()`.
 */
@NgModule()
export class NgxsSelectDecoratorSupportModule {
  static forRoot(): ModuleWithProviders<NgxsSelectDecoratorSupportModule> {
    return {
      ngModule: NgxsSelectDecoratorSupportModule,
      providers: [withNgxsSelectDecoratorSupport()]
    };
  }
}

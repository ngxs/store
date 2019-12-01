import { memoize } from '@ngxs/store/internals';

import { NgxsModule } from '../module';

/**
 * See `ɵNgModuleType`. `ɵmod` is a static property on modules
 * if `enableIvy` is `true`. We could use the `ɵivyEnabled` variable
 * from @angular/core, but we should not import any private API. Ivy-only
 * static properties, like `ɵmod`, will not change, so it's safe to use them.
 * Angular's private API could be exposed publicly and then hided again (for different
 * reasons), thus our users will face breaking changes.
 * `ɵmod` stands for `NgModuleDef` (definition of the module), see it's signature
 * internally for more details.
 * This function looks like this (getting and checking static properties) because it has
 * to be invoked before the initial DI lookup (before we build state graph and call
 * `injector.get`)
 */
export function _ivyEnabledInJitMode(): boolean {
  const module = NgxsModule as any;
  // `decorators` is a static property that is added by all Angular decorators
  // only in JIT mode
  const decorators = module.decorators;
  const ngModuleDef = module.ɵmod;
  return !!decorators && !!ngModuleDef && ngModuleDef.type === NgxsModule;
}

export const ivyEnabledInJitMode = memoize(_ivyEnabledInJitMode);

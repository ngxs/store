import { ReplaySubject } from 'rxjs';

import { getUndecoratedStateInIvyWarningMessage } from '../configs/messages.config';

// We've got such expression because Terser doesn't tree-shake `new SomeClass()` expressions
// since Terser considers them as "side-effectful". E.g. `new InjectionToken()` expression isn't
// tree-shakable even if the token has `providedIn: root` and is not used.
// The `ReplaySubject` will be subscribed inside the `ngDevMode` guard anyway.
export const ivyEnabledInDevMode$ =
  // Caretaker note: we have still left the `typeof` condition in order to avoid
  // creating a breaking change for projects that still use the View Engine.
  typeof ngDevMode === 'undefined' || ngDevMode ? new ReplaySubject<boolean>(1) : null!;

export function setIvyEnabledInDevMode(): void {
  try {
    const ng = (window as any).ng;
    const viewEngineEnabled = !!ng.probe && !!ng.coreTokens;
    const ivyEnabledInDevMode =
      !viewEngineEnabled && typeof ngDevMode !== 'undefined' && !!ngDevMode;
    // The `ngDevMode` is NOT set for projects that are still using the View Engine template compiler.
    ivyEnabledInDevMode$.next(ivyEnabledInDevMode);
  } catch {
    ivyEnabledInDevMode$.next(false);
  } finally {
    ivyEnabledInDevMode$.complete();
  }
}

/**
 * All provided or injected tokens must have `@Injectable` decorator
 * (previously, injected tokens without `@Injectable` were allowed
 * if another decorator was used, e.g. pipes).
 */
export function ensureStateClassIsInjectable(target: any): void {
  // `ɵprov` is a static property added by the NGCC compiler. It always exists in
  // AOT mode because this property is added before runtime. If an application is running in
  // JIT mode then this property can be added by the `@Injectable()` decorator. The `@Injectable()`
  // decorator has to go after the `@State()` decorator, thus we prevent users from unwanted DI errors.
  ivyEnabledInDevMode$.subscribe(_ivyEnabledInDevMode => {
    if (_ivyEnabledInDevMode) {
      const ngInjectableDef = target.ɵprov;
      if (!ngInjectableDef) {
        // Don't warn if Ivy is disabled or `ɵprov` exists on the class
        console.warn(getUndecoratedStateInIvyWarningMessage(target.name));
      }
    }
  });
}

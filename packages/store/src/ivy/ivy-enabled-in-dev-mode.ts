import { getUndecoratedStateInIvyWarningMessage } from '../configs/messages.config';

/**
 * All provided or injected tokens must have `@Injectable` decorator
 * (previously, injected tokens without `@Injectable` were allowed
 * if another decorator was used, e.g. pipes).
 */
export function ensureStateClassIsInjectable(stateClass: any): void {
  if (jit_hasInjectableAnnotation(stateClass) || aot_hasNgInjectableDef(stateClass)) {
    return;
  }

  console.warn(getUndecoratedStateInIvyWarningMessage(stateClass.name));
}

function aot_hasNgInjectableDef(stateClass: any): boolean {
  // `ɵprov` is a static property added by the NGCC compiler. It always exists in
  // AOT mode because this property is added before runtime. If an application is running in
  // JIT mode then this property can be added by the `@Injectable()` decorator. The `@Injectable()`
  // decorator has to go after the `@State()` decorator, thus we prevent users from unwanted DI errors.
  return !!stateClass.ɵprov;
}

function jit_hasInjectableAnnotation(stateClass: any): boolean {
  // `ɵprov` doesn't exist in JIT mode (for instance when running unit tests with Jest).
  const annotations = stateClass.__annotations__ || [];
  return annotations.some((annotation: any) => annotation?.ngMetadataName === 'Injectable');
}

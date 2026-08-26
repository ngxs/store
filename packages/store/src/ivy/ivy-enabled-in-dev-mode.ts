import {
  getAutoProvidedServiceStateWarningMessage,
  getUndecoratedStateWithInjectableWarningMessage
} from '../configs/messages.config';

/**
 * All provided or injected tokens must have an `@Injectable()` or `@Service()` decorator
 * (previously, injected tokens without `@Injectable()` were allowed if another decorator
 * was used, e.g. pipes).
 */
export function ensureStateClassIsInjectable(stateClass: any): void {
  const ngMetadataName = getAppliedDecoratorName(stateClass);

  if (ngMetadataName === null && !aot_hasNgInjectableDef(stateClass)) {
    console.warn(getUndecoratedStateWithInjectableWarningMessage(stateClass.name));
    return;
  }

  if (ngMetadataName === 'Service' && isAutoProvidedService(stateClass)) {
    console.warn(getAutoProvidedServiceStateWarningMessage(stateClass.name));
  }
}

function aot_hasNgInjectableDef(stateClass: any): boolean {
  // `ɵprov` is a static property added by the NGCC compiler. It always exists in
  // AOT mode because this property is added before runtime. If an application is running in
  // JIT mode then this property can be added by the `@Injectable()`/`@Service()` decorator. These
  // decorators have to go after the `@State()` decorator, thus we prevent users from unwanted DI errors.
  return !!stateClass.ɵprov;
}

// `ɵprov` doesn't exist in JIT mode until the decorator itself creates it (for instance when
// running unit tests with Jest). Both `@Injectable()` and `@Service()` are built with Angular's
// `makeDecorator`, which tags the decorator function's prototype with an `ngMetadataName`
// identifying which decorator it is. Where that metadata ends up depends on how the class was
// compiled:
// - Pure JIT (e.g. ts-jest running raw TS decorators): the decorator pushes an annotation
//   *instance* onto `__annotations__`, which inherits `ngMetadataName` off that same prototype.
// - AOT/ngtsc in dev mode (e.g. the Angular CLI's Vitest builder): `ɵprov` is emitted directly
//   and, separately, `setClassMetadata()` records `{ type: <decorator fn> }` on `.decorators` for
//   tooling, so `ngMetadataName` has to be read off `type.prototype` instead.
function getAppliedDecoratorName(stateClass: any): 'Injectable' | 'Service' | null {
  for (const annotation of stateClass.__annotations__ || []) {
    const ngMetadataName = annotation?.ngMetadataName;
    if (ngMetadataName === 'Injectable' || ngMetadataName === 'Service') {
      return ngMetadataName;
    }
  }

  for (const decorator of stateClass.decorators || []) {
    const ngMetadataName = decorator?.type?.prototype?.ngMetadataName;
    if (ngMetadataName === 'Injectable' || ngMetadataName === 'Service') {
      return ngMetadataName;
    }
  }

  return null;
}

// `@Service()` defaults `autoProvided` to `true`, which the compiler translates to
// `providedIn: 'root'` on `ɵprov` (mirroring `@Injectable({ providedIn: 'root' })`). NGXS states
// are provided explicitly through `provideStates()`/`forRoot()`/`forFeature()`, so an
// auto-provided state could be resolved independently from the root injector, out of sync with
// the instance NGXS registers (most notably for lazily-loaded feature states).
function isAutoProvidedService(stateClass: any): boolean {
  return stateClass.ɵprov?.providedIn !== null;
}

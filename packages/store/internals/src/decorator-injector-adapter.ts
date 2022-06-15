import { InjectionToken, Injector, INJECTOR, Type, ɵɵdirectiveInject } from '@angular/core';
import { ReplaySubject } from 'rxjs';

import { isAngularInTestMode } from './angular';

// Will be provided through Terser global definitions by Angular CLI
// during the production build. This is how Angular does tree-shaking internally.
declare const ngDevMode: boolean;

// https://github.com/angular/angular/blob/3a60063a54d850c50ce962a8a39ce01cfee71398/packages/compiler-cli/private/tooling.ts#L30-L33
declare const ngJitMode: boolean;

// Angular doesn't export `NG_FACTORY_DEF`.
const NG_FACTORY_DEF = 'ɵfac';

// A `Symbol` which is used to save the `Injector` onto the class instance.
const InjectorInstance: unique symbol = Symbol('InjectorInstance');

// A `Symbol` which is used to determine if factory has been decorated previously or not.
const FactoryHasBeenDecorated: unique symbol = Symbol('FactoryHasBeenDecorated');

// A `Symbol` which is used to save the notifier on the class instance. The `InjectorInstance` cannot
// be retrieved within the `constructor` since it's set after the `factory()` is called.
const InjectorNotifier: unique symbol = Symbol('InjectorNotifier');

interface PrototypeWithInjectorNotifier extends Object {
  [InjectorNotifier]?: ReplaySubject<boolean>;
}

export function ensureInjectorNotifierIsCaptured(
  target: PrototypeWithInjectorNotifier | PrivateInstance
): ReplaySubject<boolean> {
  if (target[InjectorNotifier]) {
    return target[InjectorNotifier]!;
  } else {
    const injectorNotifier$ = new ReplaySubject<boolean>(1);
    Object.defineProperty(target, InjectorNotifier, {
      get: () => injectorNotifier$
    });
    return injectorNotifier$;
  }
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function ensureLocalInjectorCaptured(target: Object): void {
  if (FactoryHasBeenDecorated in target.constructor.prototype) {
    return;
  }

  const constructor: ConstructorWithDefinitionAndFactory = target.constructor;
  // The factory is set later by the Angular compiler in JIT mode, and we're not able to patch the factory now.
  // We can't use any asynchronous code like `Promise.resolve().then(...)` since this is not functional in unit
  // tests that are being run in `SyncTestZoneSpec`.
  // Given the following example:
  // @Component()
  // class BaseComponent {}
  // @Component()
  // class MainComponent extends BaseComponent {
  //   @Select(AnimalsState) animals$: Observable<string[]>;
  // }
  // In this example, the factory will be defined for the `BaseComponent`, but will not be defined for the `MainComponent`.
  // If we try to decorate the factory immediately, we'll get `Cannot redefine property` exception when Angular will try to define
  // an original factory for the `MainComponent`.
  const isJitModeOrIsAngularInTestMode =
    (typeof ngJitMode !== 'undefined' && !!ngJitMode) || isAngularInTestMode();

  if (ngDevMode && isJitModeOrIsAngularInTestMode) {
    patchObjectDefineProperty();
  } else if (typeof constructor[NG_FACTORY_DEF] === 'function') {
    decorateFactory(constructor);
  }

  target.constructor.prototype[FactoryHasBeenDecorated] = true;
}

export function localInject<T>(
  instance: PrivateInstance,
  token: InjectionToken<T> | Type<T>
): T | null {
  const injector: Injector | undefined = instance[InjectorInstance];
  return injector ? injector.get(token) : null;
}

function decorateFactory(constructor: ConstructorWithDefinitionAndFactory): void {
  const factory = constructor[NG_FACTORY_DEF];

  if (typeof factory !== 'function') {
    return;
  }

  // Let's try to get any definition.
  // Caretaker note: this will be compatible only with Angular 9+, since Angular 9 is the first
  // Ivy-stable version. Previously definition properties were named differently (e.g. `ngComponentDef`).
  const def = constructor.ɵprov || constructor.ɵpipe || constructor.ɵcmp || constructor.ɵdir;

  const decoratedFactory = () => {
    const instance = factory();
    // Caretaker note: `inject()` won't work here.
    // We can use the `directiveInject` only during the component
    // construction, since Angular captures the currently active injector.
    // We're not able to use this function inside the getter (when the `selectorId` property is
    // requested for the first time), since the currently active injector will be null.
    instance[InjectorInstance] = ɵɵdirectiveInject(
      // We're using `INJECTOR` token except of the `Injector` class since the compiler
      // throws: `Cannot assign an abstract constructor type to a non-abstract constructor type.`.
      // Caretaker note: that this is the same way of getting the injector.
      INJECTOR
    );

    // Caretaker note: the notifier will be available only if consumers call the `ensureInjectorNotifierIsCaptured()`.
    const injectorNotifier$ = instance[InjectorNotifier];
    if (injectorNotifier$) {
      injectorNotifier$.next(true);
      injectorNotifier$.complete();
    }

    return instance;
  };

  // If we've found any definition then it's enough to override the `def.factory` since Angular
  // code uses the `def.factory` and then fallbacks to `ɵfac`.
  if (def) {
    def.factory = decoratedFactory;
  }

  // `@NgModule()` doesn't doesn't have definition factory, also providers have definitions but Angular
  // still uses the `ɵfac`.
  Object.defineProperty(constructor, NG_FACTORY_DEF, {
    get: () => decoratedFactory
  });
}

// Note: this function will be tree-shaken in production.
const patchObjectDefineProperty = (() => {
  let objectDefinePropertyPatched = false;
  return () => {
    if (objectDefinePropertyPatched) {
      return;
    }
    const defineProperty = Object.defineProperty;
    // We should not be patching globals, but there's no other way to know when it's appropriate
    // to decorate the original factory. There're different edge cases, e.g., when the class extends
    // another class, the factory will be defined for the base class but not for the child class.
    Object.defineProperty = function<T>(
      object: T,
      propertyKey: PropertyKey,
      attributes: PropertyDescriptor & ThisType<any>
    ) {
      // Angular calls `Object.defineProperty(target, 'ɵfac', { get: ..., configurable: true })` when defining a factory function.
      // We only want to intercept `ɵfac` key.
      if (
        propertyKey !== NG_FACTORY_DEF ||
        // We also call `Object.defineProperty(target, 'ɵfac', ...)`, but we don't set `configurable` property.
        (propertyKey === NG_FACTORY_DEF && !attributes.configurable)
      ) {
        defineProperty.call(this, object, propertyKey, attributes);
        return object;
      } else {
        // If the property is `ɵfac` AND `configurable` equals `true`, then let's call the original
        // implementation and then decorate the factory.
        defineProperty.call(this, object, propertyKey, attributes);
        decorateFactory((object as unknown) as ConstructorWithDefinitionAndFactory);
        return object;
      }
    };
    objectDefinePropertyPatched = true;
  };
})();

// We could've used `ɵɵFactoryDef` but we try to be backwards-compatible,
// since it's not exported in older Angular versions.
type Factory = () => PrivateInstance;

// We could've used `ɵɵInjectableDef`, `ɵɵPipeDef`, etc. We try to be backwards-compatible
// since they're not exported in older Angular versions.
interface Definition {
  factory: Factory | null;
}

interface ConstructorWithDefinitionAndFactory extends Function {
  // Provider definition for the `@Injectable()` class.
  ɵprov?: Definition;
  // Pipe definition for the `@Pipe()` class.
  ɵpipe?: Definition;
  // Component definition for the `@Component()` class.
  ɵcmp?: Definition;
  // Directive definition for the `@Directive()` class.
  ɵdir?: Definition;
  [NG_FACTORY_DEF]?: Factory;
}

interface PrivateInstance {
  [InjectorInstance]?: Injector;
  [InjectorNotifier]?: ReplaySubject<boolean>;
}

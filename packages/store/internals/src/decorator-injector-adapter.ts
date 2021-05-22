import {
  InjectionToken,
  Injector,
  INJECTOR,
  Type,
  ɵɵdirectiveInject,
  ɵglobal
} from '@angular/core';

// Will be provided through Terser global definitions by Angular CLI
// during the production build. This is how Angular does tree-shaking internally.
declare const ngDevMode: boolean;

// Angular doesn't export `NG_FACTORY_DEF`.
const NG_FACTORY_DEF = 'ɵfac';

// A `Symbol` which is used to save the `Injector` onto the class instance.
const InjectorInstance: unique symbol = Symbol('InjectorInstance');

// A `Symbol` which is used to determine if factory has been decorated previously or not.
const FactoryHasBeenDecorated: unique symbol = Symbol('FactoryHasBeenDecorated');

// eslint-disable-next-line @typescript-eslint/ban-types
export function ensureLocalInjectorCaptured(target: Object): void {
  if (FactoryHasBeenDecorated in target.constructor.prototype) {
    return;
  }

  const constructor: ConstructorWithDefinitionAndFactory = target.constructor;
  // Means we're in AOT mode.
  if (typeof constructor[NG_FACTORY_DEF] === 'function') {
    decorateFactory(constructor);
  } else if (ngDevMode) {
    // We're running in JIT mode and that means we're not able to get the compiled definition
    // on the class inside the property decorator during the current message loop tick. We have
    // to wait for the next message loop tick. Note that this is safe since this Promise will be
    // resolved even before the `APP_INITIALIZER` is resolved.
    // The below code also will be executed only in development mode, since it's never recommended
    // to use the JIT compiler in production mode (by setting "aot: false").
    decorateFactoryLater(constructor);
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
    return instance;
  };

  // If we've found any definition then it's enough to override the `def.factory` since Angular
  // code uses the `def.factory` and then fallbacks to `ɵfac`.
  if (def) {
    def.factory = decoratedFactory;
  } else {
    // `@NgModule()` doesn't doesn't have definition factory.
    Object.defineProperty(constructor, NG_FACTORY_DEF, {
      get: () => decoratedFactory
    });
  }
}

function decorateFactoryLater(constructor: ConstructorWithDefinitionAndFactory): void {
  // This function actually will be tree-shaken away when building for production since it's guarded with `ngDevMode`.
  // We're having the `try-catch` here because of the `SyncTestZoneSpec`, which throws
  // an error when micro or macrotask is used within a synchronous test. E.g. `Cannot call
  // Promise.then from within a sync test`.
  try {
    Promise.resolve().then(() => {
      decorateFactory(constructor);
    });
  } catch {
    // This is kind of a "hack", but we try to be backwards-compatible,
    // tho this `catch` block will only be executed when tests are run with Jasmine or Jest.
    ɵglobal.process &&
      ɵglobal.process.nextTick &&
      ɵglobal.process.nextTick(() => {
        decorateFactory(constructor);
      });
  }
}

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
}

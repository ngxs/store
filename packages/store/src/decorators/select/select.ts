import {
  Type,
  Injector,
  INJECTOR,
  InjectionToken,
  ɵivyEnabled,
  ɵɵdirectiveInject
} from '@angular/core';

import { Store } from '../../store';
import { createSelectObservable, createSelectorFn, PropertyType } from './symbols';

/**
 * Decorator for selecting a slice of state from the store.
 */
export function Select<T>(rawSelector?: T, ...paths: string[]): PropertyDecorator {
  return function(target, key): void {
    const name: string = key.toString();
    const selectorId = `__${name}__selector`;
    const selector = createSelectorFn(name, rawSelector, paths);

    Object.defineProperties(target, {
      [selectorId]: {
        writable: true,
        enumerable: false,
        configurable: true
      },
      [name]: {
        enumerable: true,
        configurable: true,
        get(this: PrivateInstance): PropertyType<T> {
          return (
            this[selectorId] ||
            (this[selectorId] = createSelectObservable(selector, localInject(this, Store)))
          );
        }
      }
    });

    // Keep this `if` guard here so the below stuff will be tree-shaken away in apps that still use the View Engine.
    if (ɵivyEnabled) {
      ensureLocalInjectorCaptured(target);
    }
  };
}

// Angular doesn't export `NG_FACTORY_DEF`.
const NG_FACTORY_DEF = 'ɵfac';

// A `Symbol` which is used to save the `Injector` onto the class instance.
const InjectorInstance: unique symbol = Symbol('InjectorInstance');

// A `Symbol` which is used to determine if factory has been decorated previously or not.
const FactoryHasBeenDecorated: unique symbol = Symbol('FactoryHasBeenDecorated');

// eslint-disable-next-line @typescript-eslint/ban-types
function ensureLocalInjectorCaptured(target: Object): void {
  if (FactoryHasBeenDecorated in target.constructor.prototype) {
    return;
  }

  const constructor: ConstructorWithDefinitionAndFactory = target.constructor;
  // Means we're in AOT mode.
  if (typeof constructor[NG_FACTORY_DEF] === 'function') {
    decorateFactory(constructor);
  } else {
    // We're running in JIT mode and that means we're not able to get the compiled definition
    // on the class inside the property decorator during the current message loop tick. We have
    // to wait for the next message loop tick. Note that this is safe since this Promise will be
    // resolved even before the `APP_INITIALIZER` is resolved.
    // The below code also will be executed only in development mode, since it's never recommended
    // to use the JIT compiler in production mode (by setting "aot: false").
    Promise.resolve().then(() => {
      decorateFactory(constructor);
    });
  }

  target.constructor.prototype[FactoryHasBeenDecorated] = true;
}

function localInject<T>(
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
  } else if (constructor.hasOwnProperty(NG_FACTORY_DEF)) {
    // `@NgModule()` doesn't doesn't have definition factory.
    Object.defineProperty(constructor, NG_FACTORY_DEF, {
      get: () => decoratedFactory
    });
  }
}

// We could've used `ɵɵFactoryDef` but we try to be backward compatible,
// since it's not exported in older Angular versions.
type Factory = () => PrivateInstance;

// We could've used `ɵɵInjectableDef`, `ɵɵPipeDef`, etc. We try to be backward
// compatible since they're not exported in older Angular versions.
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
  [selectorId: string]: PropertyType<unknown>;
}

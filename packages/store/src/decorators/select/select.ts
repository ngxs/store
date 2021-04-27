import { ɵɵdirectiveInject, ɵivyEnabled } from '@angular/core';

import { Store } from '../../store';
import { createSelectObservable, createSelectorFn, PropertyType } from './symbols';

/**
 * A `Symbol` which is used to save the `Store` onto the class instance.
 */
const StoreInstance: unique symbol = Symbol('StoreInstance');

/**
 * A `Symbol` which is used to determine if factory has been decorated previously or not.
 */
const FactoryHasBeenDecorated: unique symbol = Symbol('FactoryHasBeenDecorated');

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
            (this[selectorId] = createSelectObservable(selector, this[StoreInstance]))
          );
        }
      }
    });

    if (!ɵivyEnabled || FactoryHasBeenDecorated in target.constructor.prototype) {
      return;
    }

    target.constructor.prototype[FactoryHasBeenDecorated] = true;

    const constructor: ConstructorWithDefinitionAndFactory = target.constructor;
    // Means we're in AOT mode.
    if (typeof constructor.ɵfac === 'function') {
      decorateFactory(constructor);
    } else {
      // We're running in JIT mode and that means we're not able to get the compiled definition
      // on the class inside the property decorator during the current message loop tick. We have
      // to wait for the next message loop tick. Note that this is safe since this Promise will be
      // resolved even before the `APP_INITIALIZER` is resolved.
      Promise.resolve().then(() => {
        decorateFactory(constructor);
      });
    }
  };
}

function decorateFactory({
  ɵprov,
  ɵɵpipe,
  ɵcmp,
  ɵdir,
  ɵfac
}: ConstructorWithDefinitionAndFactory): void {
  // Let's try to get any definition.
  const def = ɵprov || ɵɵpipe || ɵcmp || ɵdir;

  // This means that `@Select()` decorator is used within some non-Angular class,
  // e.g. some custom class which is not decorated with `@Injectable()` or any other Angular decorator.
  if (!def) {
    return;
  }

  def.factory = () => {
    const instance = ɵfac!();
    // Note: `inject()` won't work here.
    // We can use the `directiveInject` only during the component
    // construction, since Angular captures the currently active injector.
    // We're not able to use this function inside the getter (when the `selectorId` property is
    // requested for the first time), since the currently active injector will be null.
    instance[StoreInstance] = ɵɵdirectiveInject(Store);
    return instance;
  };
}

type Factory = () => PrivateInstance;

interface Definition {
  factory: Factory | null;
}

interface ConstructorWithDefinitionAndFactory extends Function {
  // Provider definition for the `@Injectable()` class.
  ɵprov?: Definition;
  // Pipe definition for the `@Pipe()` class.
  ɵɵpipe?: Definition;
  // Component definition for the `@Component()` class.
  ɵcmp?: Definition;
  // Directive definition for the `@Directive()` class.
  ɵdir?: Definition;
  ɵfac?: Factory;
}

interface PrivateInstance {
  [StoreInstance]?: Store;
  [selectorId: string]: PropertyType<unknown>;
}

import { ɵivyEnabled } from '@angular/core';
import { ensureLocalInjectorCaptured, localInject } from '@ngxs/store/internals';

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
        get(): PropertyType<T> {
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

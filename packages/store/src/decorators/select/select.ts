import { ɵivyEnabled } from '@angular/core';
import { ensureLocalInjectorCaptured, localInject } from '@ngxs/store/internals';

import { Store } from '../../store';
import { NgxsConfig } from '../../symbols';
import { createSelectObservable, createSelectorFn, PropertyType, SelectorFn } from './symbols';

/**
 * Decorator for selecting a slice of state from the store.
 */
export function Select<T>(rawSelector?: T, ...paths: string[]): PropertyDecorator {
  return function(target, key): void {
    const name: string = key.toString();
    const selectorId = `__${name}__selector`;
    let selector: SelectorFn | null = null;

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
          // The `localInject` will be tree-shaken away in apps that
          // still use the View Engine.
          const store = ɵivyEnabled ? localInject(this, Store) : null;
          const config = ɵivyEnabled ? localInject(this, NgxsConfig) : null;

          selector = selector || createSelectorFn(config, name, rawSelector, paths);

          return (
            this[selectorId] || (this[selectorId] = createSelectObservable(selector, store))
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

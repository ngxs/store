import { ɵivyEnabled } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import {
  localInject,
  ensureLocalInjectorCaptured,
  ensureInjectorNotifierIsCaptured
} from '@ngxs/store/internals';

import { Store } from '../../store';
import { NgxsConfig } from '../../symbols';
import { createSelectObservable, createSelectorFn, SelectorFn } from './symbols';

/**
 * Decorator for selecting a slice of state from the store.
 */
export function Select<T>(rawSelector?: T, ...paths: string[]): PropertyDecorator {
  return function(target, key): void {
    const name: string = key.toString();
    const selectorId = `__${name}__selector`;
    let selector: SelectorFn | null = null;
    let injectorNotifier$: ReplaySubject<boolean> | null = null;

    if (ɵivyEnabled) {
      injectorNotifier$ = ensureInjectorNotifierIsCaptured(target);
    }

    Object.defineProperties(target, {
      [selectorId]: {
        writable: true,
        enumerable: false,
        configurable: true
      },
      [name]: {
        enumerable: true,
        configurable: true,
        get() {
          if (this[selectorId]) {
            return this[selectorId];
          }
          // The `localInject` will be tree-shaken away in apps that
          // still use the View Engine.
          if (ɵivyEnabled) {
            this[selectorId] = injectorNotifier$!.pipe(
              mergeMap(() => {
                const store = localInject(this, Store);
                const config = localInject(this, NgxsConfig);
                selector = selector || createSelectorFn(config, name, rawSelector, paths);
                return createSelectObservable(selector, store);
              })
            );
          } else {
            selector = selector || createSelectorFn(null, name, rawSelector, paths);
            this[selectorId] = createSelectObservable(selector, null);
          }
          return this[selectorId];
        }
      }
    });

    // Keep this `if` guard here so the below stuff will be tree-shaken away in apps that still use the View Engine.
    if (ɵivyEnabled) {
      ensureLocalInjectorCaptured(target);
    }
  };
}

import { Signal, inject } from '@angular/core';

import { Store } from '../store';
import { TypedSelector, ɵSelectorReturnType } from '../selectors';

export type SelectorMap = Record<string, TypedSelector<unknown>>;

export function createSelectMap<T extends SelectorMap>(selectorMap: T) {
  const store = inject(Store);

  return Object.entries(selectorMap).reduce((accumulator, [key, selector]) => {
    Object.defineProperty(accumulator, key, {
      value: store.selectSignal(selector)
    });
    return accumulator;
  }, {}) as {
    // This is inlined to enhance developer experience.
    // If we were to switch to another type, such as
    // `type SelectorMapReturnType<T extends SelectorMap> = { ... }`, code editors
    // would display the return type simply as `SelectorMapReturnType`, rather
    // than presenting it as an object with properties that correspond to
    // signals that keep store selected value.
    readonly [K in keyof T]: Signal<ɵSelectorReturnType<T[K]>>;
  };
}

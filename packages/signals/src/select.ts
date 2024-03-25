import { Signal, inject } from '@angular/core';

import { Store, TypedSelector } from '@ngxs/store';

// Not exposed publicly since we're having a discussion on the naming
// and we may rather call it differently.

/**
 * This function serves as a utility and has multiple purposes.
 * Firstly, it allows you to select properties from the state class
 * without having to inject the store class and use `this.store.selectSignal`,
 * resulting in a more concise implementation. Secondly, it can be used with
 * other solutions such as NgRx signal store with its `signalStoreFeature` or
 * `withComputed` functionalities.
 *
 * Please note that it's named `select` instead of `selectSignal` because
 * signals are evolving into first-class primitives in Angular, displacing other
 * primitives such as observables. Observables represent a stream of events,
 * whereas signals represent a single value changing over time.
 */
export function select<T>(selector: TypedSelector<T>): Signal<T> {
  return inject(Store).selectSignal(selector);
}

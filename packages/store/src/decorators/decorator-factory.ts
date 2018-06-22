import { Injectable } from '@angular/core';
import { Store } from '../store';

/**
 * Allows decorator to get access to the DI store.
 * @ignore
 */
@Injectable()
export class DecoratorFactory {
  static store: Store | undefined = undefined;
  constructor(store: Store) {
    DecoratorFactory.store = store;
  }
}

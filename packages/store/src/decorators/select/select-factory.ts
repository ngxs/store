import { DestroyRef, inject, Injectable } from '@angular/core';

import { Store } from '../../store';
import { NgxsConfig } from '../../symbols';

/**
 * Allows the select decorator to get access to the DI store, this is used internally
 * in `@Select` decorator.
 */
@Injectable({ providedIn: 'root' })
export class SelectFactory {
  static store: Store | null = null;
  static config: NgxsConfig | null = null;

  constructor(store: Store, config: NgxsConfig) {
    SelectFactory.store = store;
    SelectFactory.config = config;

    inject(DestroyRef).onDestroy(() => {
      SelectFactory.store = null;
      SelectFactory.config = null;
    });
  }
}

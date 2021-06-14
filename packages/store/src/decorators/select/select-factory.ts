import { Injectable, OnDestroy } from '@angular/core';

import { Store } from '../../store';
import { NgxsConfig } from '../../symbols';

/**
 * Allows the select decorator to get access to the DI store, this is used internally
 * in `@Select` decorator.
 */
@Injectable({ providedIn: 'root' })
export class SelectFactory implements OnDestroy {
  public static store: Store | null = null;
  public static config: NgxsConfig | null = null;

  constructor(store: Store, config: NgxsConfig) {
    SelectFactory.store = store;
    SelectFactory.config = config;
  }

  ngOnDestroy(): void {
    SelectFactory.store = null;
    SelectFactory.config = null;
  }
}

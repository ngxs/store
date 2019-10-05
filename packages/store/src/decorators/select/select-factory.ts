import { Injectable } from '@angular/core';

import { Store } from '../../store';
import { NgxsConfig } from '../../symbols';

/**
 * Allows the select decorator to get access to the DI store.
 * @internal only use in @Select decorator
 * @ignore
 */
@Injectable()
export class SelectFactory {
  public static store: Store | null = null;
  public static config: NgxsConfig | null = null;

  constructor(store: Store, config: NgxsConfig) {
    SelectFactory.store = store;
    SelectFactory.config = config;
  }
}

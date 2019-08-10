import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface NgxsFormPluginValueChangesStrategy {
  valueChanges(): (changes: Observable<any>) => Observable<any>;
}

@Injectable()
export class DefaultNgxsFormPluginValueChangesStrategy
  implements NgxsFormPluginValueChangesStrategy {
  /**
   * The default strategy acts like a noop
   */
  valueChanges() {
    return (changes: Observable<any>) => changes;
  }
}

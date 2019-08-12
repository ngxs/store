import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

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

@Injectable()
export class DeepEqualNgxsFormPluginValueChangesStrategy
  implements NgxsFormPluginValueChangesStrategy {
  valueChanges() {
    return (changes: Observable<any>) =>
      changes.pipe(distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)));
  }
}

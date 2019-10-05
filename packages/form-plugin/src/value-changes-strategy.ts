import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

export interface NgxsFormPluginValueChangesStrategy<T = any> {
  valueChanges(): (changes: Observable<T>) => Observable<T>;
}

@Injectable()
export class NoopNgxsFormPluginValueChangesStrategy
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

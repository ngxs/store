import { Observable, Observer } from 'rxjs';
import { NgZone } from '@angular/core';

/**
 * Operator to run the `subscribe` in a Angular zone.
 */
export function enterZone<T>(zone: NgZone) {
  return (source: Observable<T>) => {
    return new Observable((sink: Observer<T>) => {
      return source.subscribe({
        next(x) {
          zone.run(() => sink.next(x));
        },
        error: sink.error.bind(sink),
        complete: sink.complete.bind(sink)
      });
    });
  };
}

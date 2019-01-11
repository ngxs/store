import { NgZone } from '@angular/core';

import { MonoTypeOperatorFunction, Observable, Observer } from 'rxjs';

/**
 * Returns operator based on the provided condition `outsideZone`, that will run
 * `subscribe` inside or outside Angular's zone
 */
export function enterZone<T>(
  outsideZone: boolean | null,
  zone: NgZone
): MonoTypeOperatorFunction<T> {
  return (source: Observable<T>) => {
    return new Observable((sink: Observer<T>) => {
      return source.subscribe({
        next(value) {
          wrap(outsideZone, zone, () => sink.next(value));
        },
        error(error) {
          wrap(outsideZone, zone, () => sink.error(error));
        },
        complete() {
          wrap(outsideZone, zone, () => sink.complete());
        }
      });
    });
  };
}

function wrap(
  outsideZone: boolean | null,
  zone: NgZone,
  callback: (...args: any) => void
): void {
  if (outsideZone) {
    return zone.runOutsideAngular(callback);
  }

  zone.run(callback);
}

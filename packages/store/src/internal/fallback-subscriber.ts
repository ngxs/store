import { NgZone } from '@angular/core';
import { Observable, type Subscription } from 'rxjs';

import { executeUnhandledCallback } from './unhandled-rxjs-error-callback';

export function fallbackSubscriber<T>(ngZone: NgZone) {
  return (source: Observable<T>) => {
    let subscription: Subscription | null = source.subscribe({
      error: error => {
        ngZone.runOutsideAngular(() => {
          // Defer to a microtask so a synchronous error doesn't fire before the
          // real subscriber has attached. If an action throws synchronously the
          // error still reaches the error handler either way; RxJS reports
          // unhandled errors a tick later, so waiting one tick keeps us in sync.
          queueMicrotask(() => {
            if (subscription) {
              executeUnhandledCallback(error);
            }
          });
        });
      }
    });

    return new Observable<T>(subscriber => {
      // A real subscriber turned up, so drop the eager stand-in we started with.
      subscription?.unsubscribe();
      subscription = null;

      return source.subscribe(subscriber);
    });
  };
}

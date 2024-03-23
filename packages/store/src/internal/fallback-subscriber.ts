import { NgZone } from '@angular/core';
import { Observable, Subscription } from 'rxjs';

import { executeUnhandledCallback } from './unhandled-rxjs-error-callback';

export function fallbackSubscriber<T>(ngZone: NgZone) {
  return (source: Observable<T>) => {
    let subscription: Subscription | null = source.subscribe({
      error: error => {
        ngZone.runOutsideAngular(() => {
          // This is necessary to schedule a microtask to ensure that synchronous
          // errors are not reported before the real subscriber arrives. If an error
          // is thrown synchronously in any action, it will be reported to the error
          // handler regardless. Since RxJS reports unhandled errors asynchronously,
          // implementing a microtask ensures that we are also safe in this scenario.
          queueMicrotask(() => {
            if (subscription) {
              executeUnhandledCallback(error);
            }
          });
        });
      }
    });

    return new Observable<T>(subscriber => {
      // Now that there is a real subscriber, we can unsubscribe our pro-active subscription
      subscription?.unsubscribe();
      subscription = null;

      return source.subscribe(subscriber);
    });
  };
}

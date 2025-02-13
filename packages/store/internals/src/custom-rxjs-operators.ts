import { MonoTypeOperatorFunction, Observable } from 'rxjs';

export function ɵwrapObserverCalls<TValue>(
  invokeFn: (fn: () => void) => void
): MonoTypeOperatorFunction<TValue> {
  return (source: Observable<TValue>) => {
    return new Observable<TValue>(subscriber => {
      return source.subscribe({
        next(value) {
          invokeFn(() => subscriber.next(value));
        },
        error(error) {
          invokeFn(() => subscriber.error(error));
        },
        complete() {
          invokeFn(() => subscriber.complete());
        }
      });
    });
  };
}

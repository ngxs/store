import { MonoTypeOperatorFunction, Observable, Observer } from 'rxjs';
import { NgxsExecutionStrategy } from '../execution/symbols';

/**
 * Returns operator that will run
 * `subscribe` outside of the ngxs execution context
 */
export function leaveNgxs<T>(
  ngxsExecutionStrategy: NgxsExecutionStrategy
): MonoTypeOperatorFunction<T> {
  return (source: Observable<T>) => {
    return new Observable((sink: Observer<T>) => {
      return source.subscribe({
        next(value) {
          ngxsExecutionStrategy.leave(() => sink.next(value));
        },
        error(error) {
          ngxsExecutionStrategy.leave(() => sink.error(error));
        },
        complete() {
          ngxsExecutionStrategy.leave(() => sink.complete());
        }
      });
    });
  };
}

import { Observable } from 'rxjs';
import { InternalNgxsExecutionStrategy } from '../execution/execution-strategy';

/**
 * Returns operator that will run
 * `subscribe` outside of the ngxs execution context
 */
export function leaveNgxs<T>(ngxsExecutionStrategy: InternalNgxsExecutionStrategy) {
  return (source: Observable<T>) =>
    new Observable<T>(subscriber =>
      source.subscribe({
        next: value => ngxsExecutionStrategy.leave(() => subscriber.next(value)),
        error: error => ngxsExecutionStrategy.leave(() => subscriber.error(error)),
        complete: () => ngxsExecutionStrategy.leave(() => subscriber.complete())
      })
    );
}

import { ɵwrapObserverCalls } from '@ngxs/store/internals';
import { NgxsExecutionStrategy } from '../execution/symbols';

/**
 * Returns operator that will run
 * `subscribe` outside of the ngxs execution context
 */
export function leaveNgxs<T>(ngxsExecutionStrategy: NgxsExecutionStrategy) {
  return ɵwrapObserverCalls<T>(fn => ngxsExecutionStrategy.leave(fn));
}

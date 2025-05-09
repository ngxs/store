import { ɵwrapObserverCalls } from '@ngxs/store/internals';

import { InternalNgxsExecutionStrategy } from '../execution/execution-strategy';

/**
 * Returns operator that will run
 * `subscribe` outside of the ngxs execution context
 */
export function leaveNgxs<T>(ngxsExecutionStrategy: InternalNgxsExecutionStrategy) {
  return ɵwrapObserverCalls<T>(fn => ngxsExecutionStrategy.leave(fn));
}

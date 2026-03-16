import { inject } from '@angular/core';
import { Observable } from 'rxjs';

import { Store } from '../store';
import { ActionDef } from '../actions/symbols';

// Extends Observable so callers can subscribe to emission updates (e.g. progress, intermediate states),
// while implementing PromiseLike so the JS engine treats it as a thenable when `await` is used —
// without this dual nature, callers would have to choose upfront between async/await and reactive patterns.
class AsyncReturnType<T> extends Observable<T> implements PromiseLike<void> {
  constructor(private dispatchResult$: Observable<T>) {
    super(subscriber => dispatchResult$.subscribe(subscriber));
  }

  // Called automatically by the JS engine when `await dispatch(...)` is used.
  // The PromiseLike contract requires full generics on TResult1/TResult2 to support
  // promise chaining (e.g. `await dispatch(...).then(x => transform(x))`).
  then<TResult1 = void, TResult2 = never>(
    onfulfilled?: ((value: void) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): PromiseLike<TResult1 | TResult2> {
    return new Promise<void>((resolve, reject) => {
      this.dispatchResult$.subscribe({
        // Propagate observable errors into the promise rejection path so
        // `try/catch` around `await dispatch(...)` works as expected.
        error: reject,
        // Resolve on complete rather than on next emission — dispatch returns void,
        // so the caller cares about the action finishing, not any intermediate values.
        complete: resolve
      });
    }).then(
      // Bridge void → undefined because PromiseLike<void> resolves with no value,
      // but `onfulfilled` still needs to be invoked to continue the chain correctly.
      onfulfilled ? () => onfulfilled(undefined) : undefined,
      // Normalize null to undefined since Promise.then doesn't accept null for rejection handler.
      onrejected ?? undefined
    );
  }
}

export function dispatch<TArgs extends any[]>(ActionType: ActionDef<TArgs>) {
  const store = inject(Store);
  return (...args: TArgs) => new AsyncReturnType(store.dispatch(new ActionType(...args)));
}

import { inject } from '@angular/core';
import { Observable } from 'rxjs';

import { Store } from '../store';
import { ActionDef } from '../actions/symbols';

// It's an Observable so you can subscribe for progress / intermediate states,
// and a PromiseLike so `await dispatch(...)` works too. Being both means callers
// don't have to pick one style up front.
export class AsyncReturnType<T> extends Observable<T> implements PromiseLike<void> {
  constructor(private dispatchResult$: Observable<T>) {
    super(subscriber => dispatchResult$.subscribe(subscriber));
  }

  // The engine calls this on `await dispatch(...)`. The TResult1/TResult2
  // generics are what let you keep chaining, e.g.
  // `await dispatch(...).then(x => transform(x))`.
  then<TResult1 = void, TResult2 = never>(
    onfulfilled?: ((value: void) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): PromiseLike<TResult1 | TResult2> {
    return new Promise<void>((resolve, reject) => {
      this.dispatchResult$.subscribe({
        // Send observable errors down the reject path so `try/catch` around
        // `await dispatch(...)` catches them.
        error: reject,
        // Resolve on complete, not on the first emission: dispatch is void, so
        // what matters is the action finishing, not any values along the way.
        complete: resolve
      });
    }).then(
      // `PromiseLike<void>` resolves with nothing, so pass `undefined` through
      // to `onfulfilled` to keep the chain going.
      onfulfilled ? () => onfulfilled(undefined) : undefined,
      // `Promise.then` won't take `null` for the reject handler, so map it to undefined.
      onrejected ?? undefined
    );
  }
}

export function dispatch<TArgs extends any[]>(ActionType: ActionDef<TArgs>) {
  const store = inject(Store);
  return (...args: TArgs) => new AsyncReturnType(store.dispatch(new ActionType(...args)));
}

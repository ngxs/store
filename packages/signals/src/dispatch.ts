import { inject } from '@angular/core';
import { ActionDef, Store } from '@ngxs/store';

export function dispatch<TArgs extends any[]>(ActionType: ActionDef<TArgs>) {
  const store = inject(Store);
  return (...args: TArgs) => store.dispatch(new ActionType(...args));
}

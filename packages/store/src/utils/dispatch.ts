import { inject } from '@angular/core';

import { Store } from '../store';
import { ActionDef } from '../actions/symbols';

export function dispatch<TArgs extends any[]>(ActionType: ActionDef<TArgs>) {
  const store = inject(Store);
  return (...args: TArgs) => store.dispatch(new ActionType(...args));
}

import { StateOperator } from '@ngxs/store';

import { compose } from './compose';
import { iif } from './iif';
import { updateItem } from './update-item';
import { insertItem } from './insert-item';
import { patch } from './patch';
import { Predicate } from './internals';

/**
 * @param selector - Index of item in the array or a predicate function
 * that can be provided in `Array.prototype.findIndex`
 * @param upsertValue - New value under the `selector` index
 */
export function upsertItem<T>(
  selector: number | Predicate<T>,
  upsertValue: T
): StateOperator<T[]> {
  return compose<T[]>(
    items => <T[]>items || [],
    iif<T[]>(
      _items => Number(selector) === selector,
      iif<T[]>(
        items => selector < (<any>items!).length,
        <any>updateItem(<any>selector, <any>patch(upsertValue)),
        <any>insertItem(<any>upsertValue, <number>selector)
      ),
      iif<T[]>(
        items => (<any>items!).some(<any>selector),
        <any>updateItem(<any>selector, <any>patch(upsertValue)),
        <any>insertItem(<any>upsertValue)
      )
    )
  );
}

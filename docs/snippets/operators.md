# State Operators Snippets

In this section you will find state operators that didnt make it to the library but can be very helpful in your app.

## upsertItem

Inserts or updates an item in an array depending on whether it exists.

### Usage

```ts
ctx.setState(
  patch<FoodModel>({
    foods: upsertItem<Food>(f => f.id === foodId, food)
  })
);
```

### State Operator Code

```ts
import { Predicate } from '@ngxs/store/operators/internals';
import { StateOperator } from '@ngxs/store';
import { compose, updateItem, iif, insertItem, patch } from '@ngxs/store/operators';

export function upsertItem<T>(
  selector: number | Predicate<T>,
  upsertValue: T
): StateOperator<T[]> {
  return compose<T[]>(
    items => <T[]>(items || []),
    iif<T[]>(
      items => Number(selector) === selector,
      iif<T[]>(
        items => selector < items.length,
        <StateOperator<T[]>>updateItem(selector, patch(upsertValue)),
        <StateOperator<T[]>>insertItem(upsertValue, <number>selector)
      ),
      iif<T[]>(
        items => items.some(<any>selector),
        <StateOperator<T[]>>updateItem(selector, patch(upsertValue)),
        <StateOperator<T[]>>insertItem(upsertValue)
      )
    )
  );
}
```

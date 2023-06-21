# State Operators Snippets

In this section you will find state operators that are not part of the library but can be very helpful in your app.

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
import { StateOperator } from '@ngxs/store';
import { compose, iif, insertItem, NoInfer, patch, Predicate, updateItem } from '@ngxs/store/operators';

export function upsertItem<T>(
  selector: number | Predicate<T>,
  upsertValue: NoInfer<T>
): StateOperator<T[]> {
  return compose<T[]>(
    items => <T[]>(items || []),
    iif<T[]>(
      items => Number(selector) === selector,
      iif<T[]>(
        items => selector < items.length,
        updateItem(selector, patch(upsertValue)),
        insertItem(upsertValue, <number>selector)
      ),
      iif<T[]>(
        items => items.some(<Predicate<T>>selector),
        updateItem(selector, patch(upsertValue)),
        insertItem(upsertValue)
      )
    )
  );
}
```
### Collaborate with your awesome operator!

Have you identified an use case for a new operator? If that's the case you can collaborate sharing it here! To learn more read this [issue](https://github.com/ngxs/store/issues/926) and submit your PR with your operator as part of the _Snippets_ section.

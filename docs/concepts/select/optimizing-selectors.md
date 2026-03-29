# Optimizing Selectors

[Selectors](./) are responsible for providing state data to your application. As your application code grows, naturally the number of selectors you create also increases. Ensuring your selectors are optimized can be instrumental in building a faster performing application.

## Memoization

Selectors are memoized functions. Memoized functions are calculated when their arguments change and the results are cached. Regardless of how many components or services consume a selector, a selector will calculate only once when state changes and the cached result will be returned to all consumers. Taking advantage of this feature can result in performance increases.

For example, there exists this state model:

```ts
interface SomeStateModel {
  data: Data[];
  name: string;
}
```

And in this example there is an input component where a user can type a name. On key down, an action is dispatched updating the `name` property of state. On the same page, another component renders `data`. In order to render state data we create a selector in our state class:

```ts
@Selector()
static getViewData(state: SomeStateModel) {
   return state.data.map(d => expensiveFunction(d));
}
```

Selectors defined in state classes implicitly have `state` injected as their first argument. The above selector will be recalculated every time the user types into the input component. Since `state` could update rapidly when a user types, the expensive selector will needlessly recalculate even though it does not care about the `name` property of `state` changing. This selector does not take advantage of memoization.

One way to solve this problem is to explicitly specify selector arguments using the `@Selector([...])` decorator. By default, the `injectContainerState` selector [option](../store/options.md) is `false`, which means the container state is **not** implicitly injected as the first argument for composite selectors defined within state classes. You must explicitly specify all arguments when using `@Selector([...])`. Any parameterless `@Selector()` decorators will still inject the state as an implicit argument. Note that this option does not apply to selectors declared _outside of state classes_ (because there is no container state to inject). For example, we create two selectors in our state class:

```ts
@Selector([SomeState])
static getData(state: SomeStateModel) {
   return state.data;
}

@Selector([SomeState.getData])
static getViewData(data: Data[]) {
  return data.map(d => expensiveFunction(d));
}
```

This `getViewData` selector will not be recalculated when a user types into the input component. This selector targets the specific property of `state` it cares about as its argument by leveraging an additional selector. When the `name` property of state changes, the `getViewData` arguments _do not change_. Memoization is taken advantage of.

An alternative solution is to create a [meta selector](./#meta-selectors). For example, we declare one selector in our state class and declare another selector outside of our state class:

```ts
@State({...})
@Injectable()
export class SomeState {
  @Selector()
  static getData(state: SomeStateModel) {
    return state.data;
  }
}

export class SomeStateQueries {
  @Selector([SomeState.getData])
  static getViewData(data: Data[]) {
    return data.map(d => expensiveFunction(d));
  }
}
```

## Implementation

Selectors are calculated when state changes. As your application grows, the number of state changes increases. Finding optimizations in your selector implementations can have significant benefits.

For example, say you have this state model:

```ts
interface SelectedDataStateModel {
  selectedIds: number[];
}
```

And you have this selector:

```ts
@Selector([SelectedDataState])
isDataSelected(state: SelectedDataStateModel) {
  return (id: number) => state.selectedIds.includes(id);
}
```

The above selector is an example of a [lazy selector](./#lazy-selectors). This selector returns a function, which accepts an `id` as an argument and returns a boolean indicating whether or not this `id` is selected.

To consume this lazy selector in a component, use the standalone `select()` function, which calls `inject(Store).selectSignal` internally and returns a signal:

```ts
import { select } from '@ngxs/store';

@Component({
  selector: 'app-data-list',
  template: `
    @for (item of data(); track item.id) {
      <data-check-box [checked]="isDataSelected()(item.id)" />
    }
  `
})
export class DataListComponent {
  data = select(DataState.getData);
  isDataSelected = select(SelectedDataState.isDataSelected);
}
```

`isDataSelected` is a signal whose value is the filter function. In the template, `isDataSelected()` reads the signal and `(item.id)` invokes the returned function with the item's id.

The lazy selector returned by `isDataSelected` uses [Array.includes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/includes) and has `O(n)` time complexity. When a user checks or unchecks an item, `state.selectedIds` is updated, therefore the `isDataSelected` selector is recalculated and the list must re-render. Every time the list re-renders, the lazy selector `isDataSelected` is invoked `data.length` number of times. Because the lazy selector implementation has `O(n)` time complexity, this template renders with `O(n^2)` time complexity - **Ugh!**. One magnitude of `n` for the length of `data`, another for `state.selectedIds.length`.

Here's one way to improve performance in that example:

```ts
@Selector([SelectedDataState])
isDataSelected(state: SelectedDataStateModel) {
  const selectedIds = new Set(state.selectedIds);
  return (id: number) => selectedIds.has(id);
}
```

The above selector implementation creates a [Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set). The lazy selector returned by `isDataSelected` _is a closure with access to the `selectedIds` variable created in the parent function_. The lazy selector uses [Set.has](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set/has) which has `O(1)` time complexity.

Now when the list re-renders, because the lazy selector has `O(1)` time complexity, this template renders with `O(n)` time complexity. This optimizes performance by a magnitude of `n`.

# Type-Safe Selectors

NGXS v18+ pushes toward stronger type safety for selectors. The key challenge is that state classes do not carry their model type as part of the selector contract — when you pass a state class to `@Selector([MyState])` or `createSelector([MyState], ...)`, TypeScript cannot verify the annotated parameter type against the actual state model.

This page shows how to move from less type-safe patterns to fully type-safe ones, and introduces the selector utilities designed for this purpose.

## The Problem with State Classes as Selectors

When you write:

```ts
@Selector([ZooState])
static getAnimals(state: ZooStateModel) { ... }
```

The `ZooStateModel` annotation on `state` is not enforced by TypeScript — you could annotate it as any type and the compiler would not complain. The `ZooState` class does not carry model type information.

## Using a StateToken

A [`StateToken`](../state/token.md) ties the state name to its model type at the type level:

```ts
import { StateToken } from '@ngxs/store';

export const ZOO_STATE_TOKEN = new StateToken<ZooStateModel>('zoo');
```

Using the token as the `name` in `@State` and as the selector source makes the model type flow through automatically:

```ts
@State({ name: ZOO_STATE_TOKEN, defaults: { animals: [] } })
@Injectable()
export class ZooState {}

export class ZooSelectors {
  // TypeScript now enforces that `state` is ZooStateModel
  @Selector([ZOO_STATE_TOKEN])
  static getAnimals(state: ZooStateModel) {
    return state.animals;
  }
}
```

The token can also be passed directly to `select()` to select the full state model:

```ts
export class ZooComponent {
  zoo = select(ZOO_STATE_TOKEN); // Signal<ZooStateModel>
}
```

## Wrapping an Existing State Class

If migrating to `StateToken` is not immediately possible, you can wrap an existing state class in a typed `createSelector` call:

```ts
import { createSelector } from '@ngxs/store';

const zooState = createSelector([ZooState], s => s as ZooStateModel);
```

This gives downstream selectors a properly-typed input without modifying the state class:

```ts
export class ZooSelectors {
  @Selector([zooState])
  static getAnimals(state: ZooStateModel) {
    return state.animals;
  }
}
```

## Slicing State with createPropertySelectors

Rather than writing a separate `@Selector` for every property of a model, `createPropertySelectors` generates a typed selector for each property automatically:

```ts
import { createPropertySelectors } from '@ngxs/store';

export class ZooSelectors {
  static slices = createPropertySelectors<ZooStateModel>(ZOO_STATE_TOKEN);
  // slices.animals → TypedSelector<string[]>
  // slices.capacity → TypedSelector<number>
}
```

When passing a `StateToken`, no explicit type parameter is needed because the token already carries the model type. When passing a bare state class, you must supply the type manually:

```ts
static slices = createPropertySelectors<ZooStateModel>(ZooState); // type parameter required
```

The slices can be consumed directly in components:

```ts
export class ZooComponent {
  animals = select(ZooSelectors.slices.animals); // Signal<string[]>
}
```

Or composed into other selectors:

```ts
export class ZooSelectors {
  static slices = createPropertySelectors<ZooStateModel>(ZOO_STATE_TOKEN);

  @Selector([ZooSelectors.slices.animals])
  static getPandas(animals: string[]) {
    return animals.filter(a => a.includes('panda'));
  }
}
```

## Selecting a Subset with createPickSelector

`createPickSelector` takes a typed selector and an array of keys, and returns a selector that emits only when one of those picked properties changes. This is useful when a component only cares about part of a larger model:

```ts
import { createPickSelector } from '@ngxs/store';

export class ZooSelectors {
  // only re-evaluates when `animals` or `name` change — not when `capacity` changes
  static summary = createPickSelector(ZOO_STATE_TOKEN, ['animals', 'name']);
  // → TypedSelector<Pick<ZooStateModel, 'animals' | 'name'>>
}
```

`createPickSelector` requires a strongly-typed selector or `StateToken`. Passing a bare state class loses type information for the picked properties.

## Building View Models with createModelSelector

`createModelSelector` takes a map of selectors and returns a single selector whose output object has the same keys. This is the recommended way to assemble component view models from multiple states:

```ts
import { createModelSelector } from '@ngxs/store';

export class DashboardSelectors {
  static viewModel = createModelSelector({
    animals: ZooSelectors.slices.animals,
    openTime: ParkSelectors.slices.openTime,
    visitorCount: ParkSelectors.slices.visitorCount
  });
  // → TypedSelector<{ animals: string[], openTime: string, visitorCount: number }>
}
```

The output type is fully inferred from the selector map — no annotations required — provided each input selector is itself strongly typed (from a `StateToken`, `createPropertySelectors`, or an explicitly-typed `@Selector`).

```ts
export class DashboardComponent {
  vm = select(DashboardSelectors.viewModel);
}
```

```html
@if (vm(); as vm) {
<h1>Animals: {{ vm.animals.length }}</h1>
<p>Open from: {{ vm.openTime }} · Visitors: {{ vm.visitorCount }}</p>
}
```

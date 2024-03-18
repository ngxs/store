# State Selector Utils

## Why?

Selectors are one of the most powerful features in `NGXS`. When used in a correct way they are very performant due to the built-in memoization. However, in order to use selectors correctly we usually need to break down the state into smaller selectors that, in turn, will be used by other selectors. This approach is important to guarantee that selectors are only run when a change of interest has happened.
The process of breaking down your state into simple selectors for each property of the state model can be tedious and usually comes with a lot of boilerplate. The objective the selector utils is to make it easy to generate these selectors, combine selectors from multiple states, and create a selector based on a subset of properties of your state.

These are the provided utils:

- [createPropertySelectors](#create-property-selectors) - create a selector for each property of an object returned by a selector.
- [createModelSelector](#create-model-selector) - create a selector that returns an object which is composed from values returned by multiple selectors.
- [createPickSelector](#create-pick-selector) - create a selector that returns a subset of an object's properties, and changes only when those properties change.

## Create Property Selectors

Let's start with a common example. Here we have a small state containing animals. Check the snippet below:

```ts
import { Injectable } from '@angular/core';
import { Selector, State } from '@ngxs/store';

export interface AnimalsStateModel {
  zebras: string[];
  pandas: string[];
  monkeys?: string[];
}

@State<AnimalsStateModel>({
  name: 'animals',
  defaults: {
    zebras: [],
    pandas: [],
    monkeys: []
  }
})
@Injectable()
export class AnimalsState {}

export class AnimalsSelectors {
  @Selector([AnimalsState])
  static zebras(state: AnimalsStateModel): string[] {
    return state.zebras;
  }

  @Selector([AnimalsState])
  static pandas(state: AnimalsStateModel): string[] {
    return state.pandas;
  }

  @Selector([AnimalsState])
  static monkeys(state: AnimalsStateModel): string[] {
    return state.monkeys;
  }
}
```

Here we see how verbose the split of a state into selectors can look. We can use the `createPropertySelectors` to cleanup this code a bit. See the snippet below:

```ts
import { Selector, createPropertySelectors } from '@ngxs/store';

export class AnimalsSelectors {
  // creates map of selectors for each state property
  static slices = createPropertySelectors<AnimalStateModel>(AnimalSate);

  // slices can be used in other selectors
  @Selector([AnimalsSelectors.slices.zebras, AnimalsSelectors.slices.pandas])
  static countZebrasAndPandas(zebras: string[], pandas: string[]) {
    return zebras.length + pandas.length;
  }
}

@Component({
  selector: 'my-zoo'
  template: `
    <h1> Zebras </h1>
    <ol>
      @for (zebra of zebras(); track zebra) {
        <li>{{ zebra }}</li>
      }

    </ol>
  `,
  style: ''
})
export class MyZooComponent {
  // slices can be use directly in the components
  zebras = this.store.selectSignal(AnimalsSelectors.slices.zebras);

  constructor(private store: Store) {}
}
```

Here we see how the `createPropertySelectors` is used to create a map of selectors for each property of the state. The `createPropertySelectors` takes a state class and returns a map of selectors for each property of the state. The `createPropertySelectors` is very useful when we need to create a selector for each property of the state.

> **TYPE SAFETY:** Note that, in the `createPropertySelectors` call above, the model type was provided to the function as a type parameter. This was only necessary because the state class (`AnimalSate`) was provided and the class does not include model information. The `createPropertySelectors` function will not require a type parameter if a typed selector or a `StateToken` that includes the type of the model is provided to the function.

## Create Model Selector

Sometimes we need to create a selector simply groups other selectors. For example, we might want to create a selector that maps the state to a map of pandas and zoos. We can use the `createModelSelector` to create such a selector. See the snippet below:

```ts
import { Selector, createModelSelector } from '@ngxs/store';

export class AnimalsSelectors {
  static slices = createPropertySelectors<AnimalStateModel>(AnimalSate);

  static pandasAndZoos = createModelSelector({
    pandas: AnimalsSelectors.slices.pandas,
    zoos: ZoosSelectors.slices.zoos
  });
}

@Component({
  selector: 'my-zoo'
  template: `
    <h1> Pandas and Zoos </h1>
    @if (pandasAndZoos(); as model) {
      <ol>
        <li>Panda Count: {{ model.pandas?.length || 0 }}</li>
        <li>Zoos Count: {{ model.zoos?.length || 0 }}</li>
      </ol>
    }
  `,
})
export class MyZooComponent {
  pandasAndZoos = this.store.selectSignal(AnimalsSelectors.pandasAndZoos);

  constructor(private store: Store) {}
}
```

Here we see how the `createModelSelector` is used to create a selector that maps the state to a map of pandas and zoos. The `createModelSelector` takes a map of selectors and returns a selector that maps the state to a map of the values returned by the selectors. The `createModelSelector` is very useful when we need to create a selector that groups other selectors.

> **TYPE SAFETY:** Note that it is always best to use typed selectors in the selector map provided to the `createModelSelector` function. The output model is inferred from the selector map. A state class (eg. `AnimalSate`) does not include model information and this causes issues with the type inference. It is also questionable why an entire state would be included in a model, because this breaks encapsulation and would also cause change detection to trigger more often.

## Create Pick Selector

Sometimes we need to create a selector that picks a subset of properties from the state. For example, we might want to create a selector that picks only the `zebras` and `pandas` properties from the state. We can use the `createPickSelector` to create such a selector. See the snippet below:

```ts
import { Selector, createPickSelector } from '@ngxs/store';

export class AnimalsSelectors {
  static fullAnimalsState = createSelector([AnimalState], (state: AnimalStateModel) => state);

  static zebrasAndPandas = createPickSelector(fullAnimalsState, [
    'zebras',
    'pandas'
  ]);
}

@Component({
  selector: 'my-zoo'
  template: `
    <h1> Zebras and Pandas </h1>
    @if (zebrasAndPandas(); as zebrasAndPandas) {
      <ol>
        <li>Zerba Count: {{ zebrasAndPandas.zebras?.length || 0 }}</li>
        <li>Panda Count: {{ zebrasAndPandas.pandas?.length || 0 }}</li>
      </ol>
    }
  `,
  style: ''
})
export class MyZooComponent {
  zebrasAndPandas = this.store.selectSignal(AnimalsSelectors.zebrasAndPandas);

  constructor(private store: Store) {}
}
```

The `zebrasAndPandas` object above would only contain the `zebras` and `pandas` properties, and not have the `monkeys` property.

Here we see how the `createPickSelector` is used to create a selector that picks a subset of properties from the state, or from any other selector that returns an object for that matter. The `createPickSelector` takes a selector which returns an object and an array of property names and returns a selector that returns a copy of the object, with only the properties that have been picked. The `createPickSelector` is very useful when we need to create a selector that picks a subset of properties from the state.

> **TYPE SAFETY:** The `createPickSelector` function should only be provided a strongly typed selector or a `StateToken` that includes the type of the model. This is so that type safety is maintained for the picked properties.

**Noteable Performance win!**

One of the most useful things about the `createPickSelector` selector (versus rolling your own that creates a trimmed object from the provided selector), is that it will only emit a new value when a picked property changes, and will not emit a new value if any of the other properties change. An Angular change detection performance enthusiasts dream!

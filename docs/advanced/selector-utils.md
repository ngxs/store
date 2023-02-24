# State Selector Utils

## Why?

Selectors are one of the most powerful features in `NGXS`. When used in a correct way they are very performant due to the built-in memoization. However, in order to use selectors correctly we usually need to break down the state into smaller selectors that, in turn, will be used by other selectors. This approach is important to guarantee that selectors are only run when a change of interest has happened.
The process of breaking down your state into simple selectors for each property of the state model can be tedious and usually comes with a lot of boilerplate. The objective the selector utils is to make it easy to generate these selectors, combine selectors from multiple states, and create a selector based on a subset of properties of your state.

## Create Property Selectors

Let's start with a common example. Here we have a small state containing animals. Check the snippet below:

```ts
import { Injectable } from '@angular/core';
import { State, Action, StateContext } from '@ngxs/store';

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
  },
})
@Injectable()
export class AnimalsState {}

export class AnimalsSelectors {
  @Selector(AnimalsState)
  static zebras(state: AnimalStateModel) {
    return state.zebras;
  }

  @Selector(AnimalsState)
  static pandas(state: AnimalStateModel) {
    return state.pandas;
  }

  @Selector(AnimalsState)
  static monkeys(state: AnimalStateModel) {
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
      <li *ngFor="zebra in zebras$ | async"> {{ zebra }} </li>
    </ol>
  `,
  style: ''
})
export class MyZooComponent {
  // slices can be use directly in the components
  zebras$ = this.store.select(AnimalsSelectors.slices.zebras);

  constructor(private store: Store) {}
}
```

Here we see how the `createPropertySelectors` is used to create a map of selectors for each property of the state. The `createPropertySelectors` takes a state class and returns a map of selectors for each property of the state. The `createPropertySelectors` is very useful when we need to create a selector for each property of the state.

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
    <ol *ngIf="pandasAndZoos$ | async as model">
      <li> Panda Count: {{ model.pandas?.length || 0 }} </li>
      <li> Zoos Count: {{ model.zoos?.length || 0 }} </li>
    </ol>
  `,
  style: ''
})
export class MyZooComponent {
  pandasAndZoos$ = this.store.select(AnimalsSelectors.pandasAndZoos);

  constructor(private store: Store) {}
}
```

Here we see how the `createModelSelector` is used to create a selector that maps the state to a map of pandas and zoos. The `createModelSelector` takes a map of selectors and returns a selector that maps the state to a map of the values returned by the selectors. The `createModelSelector` is very useful when we need to create a selector that groups other selectors.

## Create Pick Selector

Sometimes we need to create a selector that picks a subset of properties from the state. For example, we might want to create a selector that picks the `zebras` and `pandas` properties from the state. We can use the `createPickSelector` to create such a selector. See the snippet below:

```ts
import { Selector, createPickSelector } from '@ngxs/store';

export class AnimalsSelectors {
  static zebrasAndPandas = createPickSelector(AnimalStateModel, [
    'zebras',
    'pandas'
  ]);
}

@Component({
  selector: 'my-zoo'
  template: `
    <h1> Zebras and Pandas </h1>
    <h1> Pandas and Zoos </h1>
    <ol *ngIf="zebrasAndPandas$ | async as zebrasAndPandas">
      <li> Panda Count: {{ zebrasAndPandas.pandas?.length || 0 }} </li>
      <li> Zoos Count: {{ zebrasAndPandas.zoos?.length || 0 }} </li>
    </ol>
  `,
  style: ''
})
export class MyZooComponent {
  zebrasAndPandas$ = this.store.select(AnimalsSelectors.zebrasAndPandas);

  constructor(private store: Store) {}
}
```

Here we see how the `createPickSelector` is used to create a selector that picks a subset of properties from the state. The `createPickSelector` takes a map of selectors and an array of property names and returns a selector that picks the properties from the state. The `createPickSelector` is very useful when we need to create a selector that picks a subset of properties from the state.

## Relevant Articles

[NGXS State Operators](https://medium.com/ngxs/ngxs-state-operators-8b339641b220)

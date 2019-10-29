# Mapped child states

NGXS provides the ability to merge multiple dynamic selectors into one.

Let's look at the code below:

```ts
interface Animal {
  type: string;
  age: string;
  name: string;
}

@State<Animal[]>({
  name: 'animals',
  defaults: [
  { type: 'zebra', age: 'old', name: 'Ponny'}.
  { type: 'panda', age: 'young', name: 'Jimmy'}.
  ]
})
export class ZooState {

  static pandas(type: string) {
    return createSelector([ZooState], (state: Animal[]) => {
        return state
          .filter(s => s.type === 'panda')
          .filter(s => s.age === type);
      }
    );
  }
  
  static zebras(type: string) {
    return createSelector([ZooState], (state: string[]) => {
        return state
          .filter(s => s.type === 'zebra')
          .filter(s => s.age === type);
      }
    );
  }
  
  static pandasAndZebras(type: string) {
    return createSelector([
      ZooState.pandas(type),
      ZooState.zebras(type),
    ], (pandas: Animal[], zebras: Animal[]) => {
        return [pandas, zebras];
      }
    );
  }
}
```
This contruct will merge 2 dynamic selectors and memoize the result.

Another example could be multiple Zoos in our application:
```ts
interface Animal {
  type: string;
  age: string;
  name: string;
}

interface ZooStateModel {
  [id: string]: {
    animals: Animal[],
    ageFilter: string;
  }
}

@State<ZooStateModel>({
  name: 'animals',
  defaults: [
 	'zoo1': {
      ageFilter: 'young',
      animals: [
        { type: 'zebra', age: 'old', name: 'Ponny'}.
        { type: 'panda', age: 'young', name: 'Jimmy'}.
      ]
    }
  ]
})
export class ZooState {

  static getZooAnimals(zooName: string) {
  	return createSelector([ZooState], (state: ZooStateModel[]) => {
        return state[zooName].animals;
      }
  }

  static pandas(zooName: string) {
    return createSelector([ZooState.getAnimals(zooName)], (animals: Animal[]) => {
        return animals
          .filter(s => s.type === 'panda')
          .filter(s => s.age === 'young');
      }
    );
  }
  
  static pandasWithoutMemoize(zooName: string) {
    return createSelector([ZooState], (state: ZooStateModel) => {
        return state[zooName].animals
          .filter(s => s.type === 'panda')
          .filter(s => s.age === 'young');
      }
    );
  }
}
```

In that example merging is required to avoid unecessary store events.
When we subscribe to Zoo.pandasWithoutMemoize store will dispatch event whenever ZooState will change (even ZooState.ageFilter), but when subscribing to Zoo.pandas store will dispatch event only if result has been changed.

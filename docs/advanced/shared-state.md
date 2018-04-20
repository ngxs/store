# Shared States
Shared state is the ability to get state from one state container and use its properties
in another state container in a read-only manner. While its not natively supported it can
be accomplished.

Let's say you have 2 stores; Animals and Preferences. In your preferences store which is backed
by localstorage you have the sort order for the Animals. You need to get the state from the
preferences in order to be able to sort your animals. This is achievable with `selectSnapshot`.

```TS
@State<PreferencesStateModel>({
  name: 'preferences',
  defaults: {
    sort: [{ prop: 'name', dir: 'asc' }]
  }
})
export class PreferencesState {}

@State<any[]>({
  name: 'animals',
  defaults: []
})
export class AnimalState {

  constructor(private store: Store) {}

  @Action(GetAnimals)
  getAnimals({ setState, getState }) {
    const state = getState();

    // select the snapshot state from preferences
    const sort = this.store.selectSnapshot(state => state.preferences.sort);

    // do sort magic here
    return state.sort(sort);
  }

}
```

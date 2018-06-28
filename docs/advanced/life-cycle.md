# Life-cycle
States can implement life-cycle events.

## `ngxsOnInit`
If a state implements the `NgxsOnInit` interface, its `ngxsOnInit` method will be invoked after
all the states from the state's module definition have been initialized and pushed into the state stream.
The states' `ngxsOnInit` methods are invoked in a topological sorted order going from parent to child.
The first parameter is the `StateContext` where you can get the current state and dispatch actions as usual.

```TS
export interface ZooStateModel {
  animals: string[];
}

@State<any[]>({
  name: 'zoo',
  defaults: {
    animals: []
  }
})
export class ZooState implements NgxsOnInit {
  ngxsOnInit(ctx: StateContext<ZooStateModel>) {
    console.log('State initialized, now getting animals');
    ctx.dispatch(new GetAnimals());
  }
}
```

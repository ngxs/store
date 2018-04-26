# Life-cycle
States can implement life-cycle events.

## `ngxsOnInit`
If you implement the `NgxsOnInit` interface the `ngxsOnInit` function will be invoked after
all the states for that module definition have been initialized and their states pushed into the state stream.
The states are invoked in a topological sorted order going from parent to child.
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
export class ZooState extends NgxsOnInit {
  ngxsOnInit(ctx: StateContext<ZooStateModel>) {
    console.log('State initialized, now getting animals');
    ctx.dispatch(new GetAnimals());
  }
}
```

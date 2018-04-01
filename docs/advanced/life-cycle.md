# Life-cycle
States can implement life-cycle events.

## `onInit`
If specified on a state, the `onInit` function will be invoked after
all the states for that module definition have been initalized and
their states pushed into the state stream. The states are invoked in a topological sorted
order going from parent to child. The function is invoked with the state context object.

```TS
@State<any[]>({
  name: 'zoo',
  defaults: []
})
export class ZooState {
  onInit(state: StateContext<any[]>) {
    console.log('State initid');
  }
}
```

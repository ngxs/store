# Composition
You can compose multiple stores together using class inheritance. This is quite simple:

```TS
@State({
  name: 'zoo',
  defaults: {
    type: null 
  }
})
class ZooState {
  @Action(Eat)
  eat(ctx: StateContext) {
    ctx.setState({ type: 'eat' });
  }
}

@State({
  name: 'stlzoo'
})
class StLouisZooState extends ZooState {
  @Action(Drink)
  drink(ctx: StateContext) {
    ctx.setState({ type: 'drink' });
  }
}
```

Now when `StLouisZooState` is invoked, it will share the actions of the `ZooState`. 
Also all state options are inherited.

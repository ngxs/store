# Composition
You can compose multiple stores together using class inheritance. This is REALLY simple:

```TS
@State({})
class ZooState {
  @Action(Eat)
  eat() {}
}

@State({})
class StLouisZooState extends ZooState {
  @Action(Drink)
  drink() {}
}
```

now when `StLouisZooState` is invoked, it will share the actions of the `ZooState`.

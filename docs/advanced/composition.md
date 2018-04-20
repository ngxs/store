# Composition
You can compose multiple stores together using class inheritance. This is quite simple:

```TS
@State({
  name: 'zoo'
})
class ZooState {
  @Action(Eat)
  eat() {}
}

@State({
  name: 'stlzoo'
})
class StLouisZooState extends ZooState {
  @Action(Drink)
  drink() {}
}
```

Now when `StLouisZooState` is invoked, it will share the actions of the `ZooState`.

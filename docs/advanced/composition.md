# Composition
You can compose multiple stores together using class inheritance. This is REALLY
simple:

```javascript
@State({})
class ZooState {
  @Action(Eat)
  eat() {}
}

@State({})
class StLouisZooState extends ZooStore {
  @Action(Drink)
  drink() {}
}
```

now when `StLouisZooState` is invoked, it will share the mutations or actions of the `ZooState`.

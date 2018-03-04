# Composition
You can compose multiple stores together using class inheritance. This is REALLY
simple:

```javascript
@Store({})
class ZooStore {
  @Mutation(Eat)
  eat() {}
}

@Store({})
class StLouisZooStore extends ZooStore {
  @Mutation(Drink)
  drink() {}
}
```

now when `StLouisZooStore` is invoked, it will share the mutations or actions of the `ZooStore`.

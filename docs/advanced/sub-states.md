# Sub Stores
Complex and large state graphs are difficult to manage. Oftentimes we need
to break these down into sub states that we can manage the items on a individual
basis. With NGXS, we can use a concept called sub states to handle this.

## Example
Let's take the following example state graph:

```javascript
{
  cart: {
    checkedout: false,
    items: [],
    saved: {
      dateSaved: new Date(),
      items: []
    };
  }
}
```

At the top, we have a `cart` with several items associated to its state.
Beneath that we have a `saved` object which represents another state slice.
To express this relationship with NGXS, we simply need to use the `children`
property in the `State` decorator:

```javascript
@State<CartStateModel>({
  name: 'cart',
  defaults: {
    checkedout: false,
    items: []
  },
  children: [CartSavedState]
})
export class CartState {}
```

then we describe our substate like normal:

```javascript
@State<CartStateModel>({
  name: 'saved',
  defaults: {
    dateSaved: new Date(),
    items: []
  }
})
export class CartSavedState {}
```

The relationship between these two are bound by their hierarchical order. To finish this up
and wire up it, we need to import both of these into the `NgxsModule`:

```javascript
@NgModule({
  imports: [
    NgxsModule.forRoot([
      CartState,
      CartSavedState
    ])
  ]
})
export class AppModule {}
```

And the store will automatically recognize the relationship and bind them together.

## Caveats
This is only intended to work with nested objects, so trying to create stores on
nested array objects will not work.

Sub states can only be used once, reuse implies several restrictions that would eliminate
some high value features. If you want to re-use them, just create a new state and inherit
from it.

[API](../README.md) > ["compose"](../modules/_compose_.md)

# External module: "compose"

## Index

### Functions

* [compose](_compose_.md#compose)

---

## Functions
<a id="compose"></a>

### `<Const>` compose

▸ **compose**(funcs: *`any`*): `(Anonymous function)`

*Defined in [compose.ts:22](https://github.com/amcdnl/ngxs/blob/bb9eb5a/packages/store/src/compose.ts#L22)*

Composes a array of functions from left to right. Example:

     compose([fn, final])(state, action);
    

then the funcs have a signature like:

     function fn (state, action, next) {
         console.log('here', state, action, next);
         return next(state, action);
     }
    
     function final (state, action) {
         console.log('here', state, action);
         return state;
     }
    

the last function should not call `next`.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| funcs | `any`   |  - |

**Returns:** `(Anonymous function)`

___


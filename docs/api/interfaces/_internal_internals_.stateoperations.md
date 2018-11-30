[API](../README.md) > ["internal/internals"](../modules/_internal_internals_.md) > [StateOperations](../interfaces/_internal_internals_.stateoperations.md)

# Interface: StateOperations

## Type parameters
#### T 
## Hierarchy

**StateOperations**

## Index

### Methods

* [dispatch](_internal_internals_.stateoperations.md#dispatch)
* [getState](_internal_internals_.stateoperations.md#getstate)
* [setState](_internal_internals_.stateoperations.md#setstate)

---

## Methods

<a id="dispatch"></a>

###  dispatch

▸ **dispatch**(actions: * `any` &#124; `any`[]*): `Observable`<`void`>

*Defined in [internal/internals.ts:23](https://github.com/ngxs/store/blob/7d8137d/packages/store/src/internal/internals.ts#L23)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| actions |  `any` &#124; `any`[]|

**Returns:** `Observable`<`void`>

___
<a id="getstate"></a>

###  getState

▸ **getState**(): `T`

*Defined in [internal/internals.ts:21](https://github.com/ngxs/store/blob/7d8137d/packages/store/src/internal/internals.ts#L21)*

**Returns:** `T`

___
<a id="setstate"></a>

###  setState

▸ **setState**(val: *`T`*): `any`

*Defined in [internal/internals.ts:22](https://github.com/ngxs/store/blob/7d8137d/packages/store/src/internal/internals.ts#L22)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| val | `T` |

**Returns:** `any`

___


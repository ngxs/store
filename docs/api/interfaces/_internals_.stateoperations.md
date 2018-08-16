[API](../README.md) > ["internals"](../modules/_internals_.md) > [StateOperations](../interfaces/_internals_.stateoperations.md)

# Interface: StateOperations

## Type parameters
#### T 
## Hierarchy

**StateOperations**

## Index

### Methods

* [dispatch](_internals_.stateoperations.md#dispatch)
* [getState](_internals_.stateoperations.md#getstate)
* [setState](_internals_.stateoperations.md#setstate)

---

## Methods

<a id="dispatch"></a>

###  dispatch

▸ **dispatch**(actions: *`any` |`any`[]*): `Observable`<`void`>

*Defined in [internals.ts:23](https://github.com/amcdnl/ngxs/blob/4ba1032/packages/store/src/internals.ts#L23)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| actions | `any` |
`any`[]
 | 

**Returns:** `Observable`<`void`>

___
<a id="getstate"></a>

###  getState

▸ **getState**(): `T`

*Defined in [internals.ts:21](https://github.com/amcdnl/ngxs/blob/4ba1032/packages/store/src/internals.ts#L21)*

**Returns:** `T`

___
<a id="setstate"></a>

###  setState

▸ **setState**(val: *`T`*): `any`

*Defined in [internals.ts:22](https://github.com/amcdnl/ngxs/blob/4ba1032/packages/store/src/internals.ts#L22)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| val | `T` | 

**Returns:** `any`

___


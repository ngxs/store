[API](../README.md) > ["symbols"](../modules/_symbols_.md) > [StateContext](../interfaces/_symbols_.statecontext.md)

# Interface: StateContext

State context provided to the actions in the state.

## Type parameters
#### T 
## Hierarchy

**StateContext**

## Index

### Methods

* [dispatch](_symbols_.statecontext.md#dispatch)
* [getState](_symbols_.statecontext.md#getstate)
* [patchState](_symbols_.statecontext.md#patchstate)
* [setState](_symbols_.statecontext.md#setstate)

---

## Methods

<a id="dispatch"></a>

###  dispatch

▸ **dispatch**(actions: *`any` |`any`[]*): `Observable`<`void`>

*Defined in [symbols.ts:46](https://github.com/amcdnl/ngxs/blob/4ba1032/packages/store/src/symbols.ts#L46)*

Dispatch a new action and return the dispatched observable.

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

*Defined in [symbols.ts:31](https://github.com/amcdnl/ngxs/blob/4ba1032/packages/store/src/symbols.ts#L31)*

Get the current state.

**Returns:** `T`

___
<a id="patchstate"></a>

###  patchState

▸ **patchState**(val: *`Partial`<`T`>*): `any`

*Defined in [symbols.ts:41](https://github.com/amcdnl/ngxs/blob/4ba1032/packages/store/src/symbols.ts#L41)*

Patch the existing state with the provided value.

**Parameters:**

| Param | Type |
| ------ | ------ |
| val | `Partial`<`T`> | 

**Returns:** `any`

___
<a id="setstate"></a>

###  setState

▸ **setState**(val: *`T`*): `any`

*Defined in [symbols.ts:36](https://github.com/amcdnl/ngxs/blob/4ba1032/packages/store/src/symbols.ts#L36)*

Reset the state to a new value.

**Parameters:**

| Param | Type |
| ------ | ------ |
| val | `T` | 

**Returns:** `any`

___


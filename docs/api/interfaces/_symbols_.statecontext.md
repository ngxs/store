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

▸ **dispatch**(actions: * `any` &#124; `any`[]*): `Observable`<`void`>

*Defined in [symbols.ts:61](https://github.com/ngxs/store/blob/7d8137d/packages/store/src/symbols.ts#L61)*

Dispatch a new action and return the dispatched observable.

**Parameters:**

| Name | Type |
| ------ | ------ |
| actions |  `any` &#124; `any`[]|

**Returns:** `Observable`<`void`>

___
<a id="getstate"></a>

###  getState

▸ **getState**(): `T`

*Defined in [symbols.ts:46](https://github.com/ngxs/store/blob/7d8137d/packages/store/src/symbols.ts#L46)*

Get the current state.

**Returns:** `T`

___
<a id="patchstate"></a>

###  patchState

▸ **patchState**(val: *`Partial`<`T`>*): `any`

*Defined in [symbols.ts:56](https://github.com/ngxs/store/blob/7d8137d/packages/store/src/symbols.ts#L56)*

Patch the existing state with the provided value.

**Parameters:**

| Name | Type |
| ------ | ------ |
| val | `Partial`<`T`> |

**Returns:** `any`

___
<a id="setstate"></a>

###  setState

▸ **setState**(val: *`T`*): `any`

*Defined in [symbols.ts:51](https://github.com/ngxs/store/blob/7d8137d/packages/store/src/symbols.ts#L51)*

Reset the state to a new value.

**Parameters:**

| Name | Type |
| ------ | ------ |
| val | `T` |

**Returns:** `any`

___


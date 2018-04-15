[API](../README.md) > ["symbols"](../modules/_symbols_.md) > [StateContext](../interfaces/_symbols_.statecontext.md)

# Interface: StateContext

State context provided to the actions in the state.

## Type parameters
#### T 
## Methods
<a id="dispatch"></a>

###  dispatch

▸ **dispatch**(actions: *`any`⎮`any`[]*): `Observable`.<`void`>

*Defined in [symbols.ts:34](https://github.com/amcdnl/ngxs/blob/bb9eb5a/packages/store/src/symbols.ts#L34)*

Dispatch a new action and return the dispatched observable.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| actions | `any`⎮`any`[]   |  - |

**Returns:** `Observable`.<`void`>

___

<a id="getstate"></a>

###  getState

▸ **getState**(): `T`

*Defined in [symbols.ts:19](https://github.com/amcdnl/ngxs/blob/bb9eb5a/packages/store/src/symbols.ts#L19)*

Get the current state.

**Returns:** `T`

___

<a id="patchstate"></a>

###  patchState

▸ **patchState**(val: *`Partial`.<`T`>*): `any`

*Defined in [symbols.ts:29](https://github.com/amcdnl/ngxs/blob/bb9eb5a/packages/store/src/symbols.ts#L29)*

Patch the existing state with the provided value.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| val | `Partial`.<`T`>   |  - |

**Returns:** `any`

___

<a id="setstate"></a>

###  setState

▸ **setState**(val: *`T`*): `any`

*Defined in [symbols.ts:24](https://github.com/amcdnl/ngxs/blob/bb9eb5a/packages/store/src/symbols.ts#L24)*

Reset the state to a new value.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| val | `T`   |  - |

**Returns:** `any`

___


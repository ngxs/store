[API](../README.md) > ["operators/of-action"](../modules/_operators_of_action_.md)

# External module: "operators/of-action"

## Index

### Functions

* [createAllowedMap](_operators_of_action_.md#createallowedmap)
* [filterStatus](_operators_of_action_.md#filterstatus)
* [mapAction](_operators_of_action_.md#mapaction)
* [ofAction](_operators_of_action_.md#ofaction)
* [ofActionCanceled](_operators_of_action_.md#ofactioncanceled)
* [ofActionDispatched](_operators_of_action_.md#ofactiondispatched)
* [ofActionErrored](_operators_of_action_.md#ofactionerrored)
* [ofActionOperator](_operators_of_action_.md#ofactionoperator)
* [ofActionSuccessful](_operators_of_action_.md#ofactionsuccessful)

---

## Functions

<a id="createallowedmap"></a>

###  createAllowedMap

▸ **createAllowedMap**(types: *`any`[]*): `object`

*Defined in [operators/of-action.ts:76](https://github.com/ngxs/store/blob/7d8137d/packages/store/src/operators/of-action.ts#L76)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| types | `any`[] |

**Returns:** `object`

___
<a id="filterstatus"></a>

###  filterStatus

▸ **filterStatus**(allowedTypes: *`object`*, status?: *[ActionStatus](../enums/_actions_stream_.actionstatus.md)*): `MonoTypeOperatorFunction`<[ActionContext](../interfaces/_actions_stream_.actioncontext.md)>

*Defined in [operators/of-action.ts:64](https://github.com/ngxs/store/blob/7d8137d/packages/store/src/operators/of-action.ts#L64)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| allowedTypes | `object` |
| `Optional` status | [ActionStatus](../enums/_actions_stream_.actionstatus.md) |

**Returns:** `MonoTypeOperatorFunction`<[ActionContext](../interfaces/_actions_stream_.actioncontext.md)>

___
<a id="mapaction"></a>

###  mapAction

▸ **mapAction**(): `OperatorFunction`<[ActionContext](../interfaces/_actions_stream_.actioncontext.md), `any`>

*Defined in [operators/of-action.ts:72](https://github.com/ngxs/store/blob/7d8137d/packages/store/src/operators/of-action.ts#L72)*

**Returns:** `OperatorFunction`<[ActionContext](../interfaces/_actions_stream_.actioncontext.md), `any`>

___
<a id="ofaction"></a>

###  ofAction

▸ **ofAction**<`T`>(allowedType: *`any`*): `OperatorFunction`<`any`, `T`>

▸ **ofAction**<`T`>(...allowedTypes: *`any`[]*): `OperatorFunction`<`any`, `T`>

*Defined in [operators/of-action.ts:6](https://github.com/ngxs/store/blob/7d8137d/packages/store/src/operators/of-action.ts#L6)*

RxJS operator for selecting out specific actions.

This will grab actions that have just been dispatched as well as actions that have completed

**Type parameters:**

#### T 
**Parameters:**

| Name | Type |
| ------ | ------ |
| allowedType | `any` |

**Returns:** `OperatorFunction`<`any`, `T`>

*Defined in [operators/of-action.ts:7](https://github.com/ngxs/store/blob/7d8137d/packages/store/src/operators/of-action.ts#L7)*

RxJS operator for selecting out specific actions.

This will grab actions that have just been dispatched as well as actions that have completed

**Type parameters:**

#### T 
**Parameters:**

| Name | Type |
| ------ | ------ |
| `Rest` allowedTypes | `any`[] |

**Returns:** `OperatorFunction`<`any`, `T`>

___
<a id="ofactioncanceled"></a>

###  ofActionCanceled

▸ **ofActionCanceled**(...allowedTypes: *`any`[]*): `(Anonymous function)`

*Defined in [operators/of-action.ts:41](https://github.com/ngxs/store/blob/7d8137d/packages/store/src/operators/of-action.ts#L41)*

RxJS operator for selecting out specific actions.

This will ONLY grab actions that have just been canceled

**Parameters:**

| Name | Type |
| ------ | ------ |
| `Rest` allowedTypes | `any`[] |

**Returns:** `(Anonymous function)`

___
<a id="ofactiondispatched"></a>

###  ofActionDispatched

▸ **ofActionDispatched**(...allowedTypes: *`any`[]*): `(Anonymous function)`

*Defined in [operators/of-action.ts:23](https://github.com/ngxs/store/blob/7d8137d/packages/store/src/operators/of-action.ts#L23)*

RxJS operator for selecting out specific actions.

This will ONLY grab actions that have just been dispatched

**Parameters:**

| Name | Type |
| ------ | ------ |
| `Rest` allowedTypes | `any`[] |

**Returns:** `(Anonymous function)`

___
<a id="ofactionerrored"></a>

###  ofActionErrored

▸ **ofActionErrored**(...allowedTypes: *`any`[]*): `(Anonymous function)`

*Defined in [operators/of-action.ts:50](https://github.com/ngxs/store/blob/7d8137d/packages/store/src/operators/of-action.ts#L50)*

RxJS operator for selecting out specific actions.

This will ONLY grab actions that have just thrown an error

**Parameters:**

| Name | Type |
| ------ | ------ |
| `Rest` allowedTypes | `any`[] |

**Returns:** `(Anonymous function)`

___
<a id="ofactionoperator"></a>

###  ofActionOperator

▸ **ofActionOperator**(allowedTypes: *`any`[]*, status?: *[ActionStatus](../enums/_actions_stream_.actionstatus.md)*): `(Anonymous function)`

*Defined in [operators/of-action.ts:54](https://github.com/ngxs/store/blob/7d8137d/packages/store/src/operators/of-action.ts#L54)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| allowedTypes | `any`[] |
| `Optional` status | [ActionStatus](../enums/_actions_stream_.actionstatus.md) |

**Returns:** `(Anonymous function)`

___
<a id="ofactionsuccessful"></a>

###  ofActionSuccessful

▸ **ofActionSuccessful**(...allowedTypes: *`any`[]*): `(Anonymous function)`

*Defined in [operators/of-action.ts:32](https://github.com/ngxs/store/blob/7d8137d/packages/store/src/operators/of-action.ts#L32)*

RxJS operator for selecting out specific actions.

This will ONLY grab actions that have just been successfully completed

**Parameters:**

| Name | Type |
| ------ | ------ |
| `Rest` allowedTypes | `any`[] |

**Returns:** `(Anonymous function)`

___


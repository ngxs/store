[API](../README.md) > ["of-action"](../modules/_of_action_.md)

# External module: "of-action"

## Index

### Functions

* [createAllowedMap](_of_action_.md#createallowedmap)
* [filterStatus](_of_action_.md#filterstatus)
* [mapAction](_of_action_.md#mapaction)
* [ofAction](_of_action_.md#ofaction)
* [ofActionSuccessful](_of_action_.md#ofactionsuccessful)
* [ofActionDispatched](_of_action_.md#ofactiondispatched)
* [ofActionErrored](_of_action_.md#ofactionerrored)
* [ofActionOperator](_of_action_.md#ofactionoperator)

---

## Functions
<a id="createallowedmap"></a>

###  createAllowedMap

▸ **createAllowedMap**(types: *`any`[]*): `object`

*Defined in [of-action.ts:64](https://github.com/amcdnl/ngxs/blob/bb9eb5a/packages/store/src/of-action.ts#L64)*

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| types | `any`[]   |  - |

**Returns:** `object`

___

<a id="filterstatus"></a>

###  filterStatus

▸ **filterStatus**(allowedTypes: *`object`*, status?: *[ActionStatus](../enums/_actions_stream_.actionstatus.md)*): `MonoTypeOperatorFunction`.<[ActionContext](../interfaces/_actions_stream_.actioncontext.md)>

*Defined in [of-action.ts:52](https://github.com/amcdnl/ngxs/blob/bb9eb5a/packages/store/src/of-action.ts#L52)*

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| allowedTypes | `object`   |  - |
| status | [ActionStatus](../enums/_actions_stream_.actionstatus.md)   |  - |

**Returns:** `MonoTypeOperatorFunction`.<[ActionContext](../interfaces/_actions_stream_.actioncontext.md)>

___

<a id="mapaction"></a>

###  mapAction

▸ **mapAction**(): `OperatorFunction`.<[ActionContext](../interfaces/_actions_stream_.actioncontext.md)>,.<`any`>

*Defined in [of-action.ts:60](https://github.com/amcdnl/ngxs/blob/bb9eb5a/packages/store/src/of-action.ts#L60)*

**Returns:** `OperatorFunction`.<[ActionContext](../interfaces/_actions_stream_.actioncontext.md)>,.<`any`>

___

<a id="ofaction"></a>

###  ofAction

▸ **ofAction**T(allowedType: *`any`*): `OperatorFunction`.<`any`>,.<`T`>

▸ **ofAction**T(...allowedTypes: *`any`[]*): `OperatorFunction`.<`any`>,.<`T`>

*Defined in [of-action.ts:6](https://github.com/amcdnl/ngxs/blob/bb9eb5a/packages/store/src/of-action.ts#L6)*

RxJS operator for selecting out specific actions.

This will grab actions that have just been dispatched as well as actions that have completed

**Type parameters:**

#### T 
**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| allowedType | `any`   |  - |

**Returns:** `OperatorFunction`.<`any`>,.<`T`>

*Defined in [of-action.ts:7](https://github.com/amcdnl/ngxs/blob/bb9eb5a/packages/store/src/of-action.ts#L7)*

RxJS operator for selecting out specific actions.

This will grab actions that have just been dispatched as well as actions that have completed

**Type parameters:**

#### T 
**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| allowedTypes | `any`[]   |  - |

**Returns:** `OperatorFunction`.<`any`>,.<`T`>

___

<a id="ofactionsuccessful"></a>

###  ofActionSuccessful

▸ **ofActionSuccessful**(...allowedTypes: *`any`[]*): `(Anonymous function)`

*Defined in [of-action.ts:32](https://github.com/amcdnl/ngxs/blob/bb9eb5a/packages/store/src/of-action.ts#L32)*

RxJS operator for selecting out specific actions.

This will ONLY grab actions that have just been completed

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| allowedTypes | `any`[]   |  - |

**Returns:** `(Anonymous function)`

___

<a id="ofactiondispatched"></a>

###  ofActionDispatched

▸ **ofActionDispatched**(...allowedTypes: *`any`[]*): `(Anonymous function)`

*Defined in [of-action.ts:23](https://github.com/amcdnl/ngxs/blob/bb9eb5a/packages/store/src/of-action.ts#L23)*

RxJS operator for selecting out specific actions.

This will ONLY grab actions that have just been dispatched

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| allowedTypes | `any`[]   |  - |

**Returns:** `(Anonymous function)`

___

<a id="ofactionerrored"></a>

###  ofActionErrored

▸ **ofActionErrored**(...allowedTypes: *`any`[]*): `(Anonymous function)`

*Defined in [of-action.ts:41](https://github.com/amcdnl/ngxs/blob/bb9eb5a/packages/store/src/of-action.ts#L41)*

RxJS operator for selecting out specific actions.

This will ONLY grab actions that have thrown an error

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| allowedTypes | `any`[]   |  - |

**Returns:** `(Anonymous function)`

___

<a id="ofactionoperator"></a>

###  ofActionOperator

▸ **ofActionOperator**(allowedTypes: *`any`[]*, status?: *[ActionStatus](../enums/_actions_stream_.actionstatus.md)*): `(Anonymous function)`

*Defined in [of-action.ts:45](https://github.com/amcdnl/ngxs/blob/bb9eb5a/packages/store/src/of-action.ts#L45)*

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| allowedTypes | `any`[]   |  - |
| status | [ActionStatus](../enums/_actions_stream_.actionstatus.md)   |  - |

**Returns:** `(Anonymous function)`

___


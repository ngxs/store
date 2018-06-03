[API](../README.md) > ["of-action"](../modules/_of_action_.md)

# External module: "of-action"

## Index

### Functions

* [createAllowedMap](_of_action_.md#createallowedmap)
* [filterStatus](_of_action_.md#filterstatus)
* [mapAction](_of_action_.md#mapaction)
* [ofAction](_of_action_.md#ofaction)
* [ofActionCanceled](_of_action_.md#ofactioncanceled)
* [ofActionDispatched](_of_action_.md#ofactiondispatched)
* [ofActionErrored](_of_action_.md#ofactionerrored)
* [ofActionOperator](_of_action_.md#ofactionoperator)
* [ofActionSuccessful](_of_action_.md#ofactionsuccessful)

---

## Functions

<a id="createallowedmap"></a>

###  createAllowedMap

▸ **createAllowedMap**(types: *`any`[]*): `object`

*Defined in [of-action.ts:73](https://github.com/amcdnl/ngxs/blob/4ba1032/packages/store/src/of-action.ts#L73)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| types | `any`[] | 

**Returns:** `object`

___
<a id="filterstatus"></a>

###  filterStatus

▸ **filterStatus**(allowedTypes: *`object`*, status?: *[ActionStatus](../enums/_actions_stream_.actionstatus.md)*): `MonoTypeOperatorFunction`<[ActionContext](../interfaces/_actions_stream_.actioncontext.md)>

*Defined in [of-action.ts:61](https://github.com/amcdnl/ngxs/blob/4ba1032/packages/store/src/of-action.ts#L61)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| allowedTypes | `object` | 
| `Optional` status | [ActionStatus](../enums/_actions_stream_.actionstatus.md) | 

**Returns:** `MonoTypeOperatorFunction`<[ActionContext](../interfaces/_actions_stream_.actioncontext.md)>

___
<a id="mapaction"></a>

###  mapAction

▸ **mapAction**(): `OperatorFunction`<[ActionContext](../interfaces/_actions_stream_.actioncontext.md), `any`>

*Defined in [of-action.ts:69](https://github.com/amcdnl/ngxs/blob/4ba1032/packages/store/src/of-action.ts#L69)*

**Returns:** `OperatorFunction`<[ActionContext](../interfaces/_actions_stream_.actioncontext.md), `any`>

___
<a id="ofaction"></a>

###  ofAction

▸ **ofAction**T(allowedType: *`any`*): `OperatorFunction`<`any`, `T`>

▸ **ofAction**T(...allowedTypes: *`any`[]*): `OperatorFunction`<`any`, `T`>

*Defined in [of-action.ts:6](https://github.com/amcdnl/ngxs/blob/4ba1032/packages/store/src/of-action.ts#L6)*

RxJS operator for selecting out specific actions.

This will grab actions that have just been dispatched as well as actions that have completed

**Type parameters:**

#### T 
**Parameters:**

| Param | Type |
| ------ | ------ |
| allowedType | `any` | 

**Returns:** `OperatorFunction`<`any`, `T`>

*Defined in [of-action.ts:7](https://github.com/amcdnl/ngxs/blob/4ba1032/packages/store/src/of-action.ts#L7)*

RxJS operator for selecting out specific actions.

This will grab actions that have just been dispatched as well as actions that have completed

**Type parameters:**

#### T 
**Parameters:**

| Param | Type |
| ------ | ------ |
| `Rest` allowedTypes | `any`[] | 

**Returns:** `OperatorFunction`<`any`, `T`>

___
<a id="ofactioncanceled"></a>

###  ofActionCanceled

▸ **ofActionCanceled**(...allowedTypes: *`any`[]*): `(Anonymous function)`

*Defined in [of-action.ts:41](https://github.com/amcdnl/ngxs/blob/4ba1032/packages/store/src/of-action.ts#L41)*

RxJS operator for selecting out specific actions.

This will ONLY grab actions that have just been canceled

**Parameters:**

| Param | Type |
| ------ | ------ |
| `Rest` allowedTypes | `any`[] | 

**Returns:** `(Anonymous function)`

___
<a id="ofactiondispatched"></a>

###  ofActionDispatched

▸ **ofActionDispatched**(...allowedTypes: *`any`[]*): `(Anonymous function)`

*Defined in [of-action.ts:23](https://github.com/amcdnl/ngxs/blob/4ba1032/packages/store/src/of-action.ts#L23)*

RxJS operator for selecting out specific actions.

This will ONLY grab actions that have just been dispatched

**Parameters:**

| Param | Type |
| ------ | ------ |
| `Rest` allowedTypes | `any`[] | 

**Returns:** `(Anonymous function)`

___
<a id="ofactionerrored"></a>

###  ofActionErrored

▸ **ofActionErrored**(...allowedTypes: *`any`[]*): `(Anonymous function)`

*Defined in [of-action.ts:50](https://github.com/amcdnl/ngxs/blob/4ba1032/packages/store/src/of-action.ts#L50)*

RxJS operator for selecting out specific actions.

This will ONLY grab actions that have just thrown an error

**Parameters:**

| Param | Type |
| ------ | ------ |
| `Rest` allowedTypes | `any`[] | 

**Returns:** `(Anonymous function)`

___
<a id="ofactionoperator"></a>

###  ofActionOperator

▸ **ofActionOperator**(allowedTypes: *`any`[]*, status?: *[ActionStatus](../enums/_actions_stream_.actionstatus.md)*): `(Anonymous function)`

*Defined in [of-action.ts:54](https://github.com/amcdnl/ngxs/blob/4ba1032/packages/store/src/of-action.ts#L54)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| allowedTypes | `any`[] | 
| `Optional` status | [ActionStatus](../enums/_actions_stream_.actionstatus.md) | 

**Returns:** `(Anonymous function)`

___
<a id="ofactionsuccessful"></a>

###  ofActionSuccessful

▸ **ofActionSuccessful**(...allowedTypes: *`any`[]*): `(Anonymous function)`

*Defined in [of-action.ts:32](https://github.com/amcdnl/ngxs/blob/4ba1032/packages/store/src/of-action.ts#L32)*

RxJS operator for selecting out specific actions.

This will ONLY grab actions that have just been successfully completed

**Parameters:**

| Param | Type |
| ------ | ------ |
| `Rest` allowedTypes | `any`[] | 

**Returns:** `(Anonymous function)`

___


[API](../README.md) > ["store"](../modules/_store_.md) > [Store](../classes/_store_.store.md)

# Class: Store

## Hierarchy

**Store**

## Index

### Constructors

* [constructor](_store_.store.md#constructor)

### Methods

* [dispatch](_store_.store.md#dispatch)
* [reset](_store_.store.md#reset)
* [select](_store_.store.md#select)
* [selectOnce](_store_.store.md#selectonce)
* [selectSnapshot](_store_.store.md#selectsnapshot)
* [snapshot](_store_.store.md#snapshot)
* [subscribe](_store_.store.md#subscribe)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new Store**(_ngZone: *`NgZone`*, _stateStream: *`StateStream`*, _internalStateOperations: *`InternalStateOperations`*): [Store](_store_.store.md)

*Defined in [store.ts:11](https://github.com/ngxs/store/blob/7d8137d/packages/store/src/store.ts#L11)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| _ngZone | `NgZone` |
| _stateStream | `StateStream` |
| _internalStateOperations | `InternalStateOperations` |

**Returns:** [Store](_store_.store.md)

___

## Methods

<a id="dispatch"></a>

###  dispatch

▸ **dispatch**(event: * `any` &#124; `any`[]*): `Observable`<`any`>

*Defined in [store.ts:21](https://github.com/ngxs/store/blob/7d8137d/packages/store/src/store.ts#L21)*

Dispatches event(s).

**Parameters:**

| Name | Type |
| ------ | ------ |
| event |  `any` &#124; `any`[]|

**Returns:** `Observable`<`any`>

___
<a id="reset"></a>

###  reset

▸ **reset**(state: *`any`*): `any`

*Defined in [store.ts:85](https://github.com/ngxs/store/blob/7d8137d/packages/store/src/store.ts#L85)*

Reset the state to a specific point in time. This method is useful for plugin's who need to modify the state directly or unit testing.

**Parameters:**

| Name | Type |
| ------ | ------ |
| state | `any` |

**Returns:** `any`

___
<a id="select"></a>

###  select

▸ **select**<`T`>(selector: *`function`*): `Observable`<`T`>

▸ **select**(selector: * `string` &#124; `any`*): `Observable`<`any`>

*Defined in [store.ts:28](https://github.com/ngxs/store/blob/7d8137d/packages/store/src/store.ts#L28)*

Selects a slice of data from the store.

**Type parameters:**

#### T 
**Parameters:**

| Name | Type |
| ------ | ------ |
| selector | `function` |

**Returns:** `Observable`<`T`>

*Defined in [store.ts:29](https://github.com/ngxs/store/blob/7d8137d/packages/store/src/store.ts#L29)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| selector |  `string` &#124; `any`|

**Returns:** `Observable`<`any`>

___
<a id="selectonce"></a>

###  selectOnce

▸ **selectOnce**<`T`>(selector: *`function`*): `Observable`<`T`>

▸ **selectOnce**(selector: * `string` &#124; `any`*): `Observable`<`any`>

*Defined in [store.ts:51](https://github.com/ngxs/store/blob/7d8137d/packages/store/src/store.ts#L51)*

Select one slice of data from the store.

**Type parameters:**

#### T 
**Parameters:**

| Name | Type |
| ------ | ------ |
| selector | `function` |

**Returns:** `Observable`<`T`>

*Defined in [store.ts:52](https://github.com/ngxs/store/blob/7d8137d/packages/store/src/store.ts#L52)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| selector |  `string` &#124; `any`|

**Returns:** `Observable`<`any`>

___
<a id="selectsnapshot"></a>

###  selectSnapshot

▸ **selectSnapshot**<`T`>(selector: *`function`*): `T`

▸ **selectSnapshot**(selector: * `string` &#124; `any`*): `any`

*Defined in [store.ts:60](https://github.com/ngxs/store/blob/7d8137d/packages/store/src/store.ts#L60)*

Select a snapshot from the state.

**Type parameters:**

#### T 
**Parameters:**

| Name | Type |
| ------ | ------ |
| selector | `function` |

**Returns:** `T`

*Defined in [store.ts:61](https://github.com/ngxs/store/blob/7d8137d/packages/store/src/store.ts#L61)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| selector |  `string` &#124; `any`|

**Returns:** `any`

___
<a id="snapshot"></a>

###  snapshot

▸ **snapshot**(): `any`

*Defined in [store.ts:77](https://github.com/ngxs/store/blob/7d8137d/packages/store/src/store.ts#L77)*

Return the raw value of the state.

**Returns:** `any`

___
<a id="subscribe"></a>

###  subscribe

▸ **subscribe**(fn?: *`any`*): `Subscription`

*Defined in [store.ts:70](https://github.com/ngxs/store/blob/7d8137d/packages/store/src/store.ts#L70)*

Allow the user to subscribe to the root of the state

**Parameters:**

| Name | Type |
| ------ | ------ |
| `Optional` fn | `any` |

**Returns:** `Subscription`

___


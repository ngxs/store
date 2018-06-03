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

⊕ **new Store**(_stateStream: *[StateStream](_state_stream_.statestream.md)*, _internalStateOperations: *[InternalStateOperations](_state_operations_.internalstateoperations.md)*): [Store](_store_.store.md)

*Defined in [store.ts:10](https://github.com/amcdnl/ngxs/blob/4ba1032/packages/store/src/store.ts#L10)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| _stateStream | [StateStream](_state_stream_.statestream.md) | 
| _internalStateOperations | [InternalStateOperations](_state_operations_.internalstateoperations.md) | 

**Returns:** [Store](_store_.store.md)

___

## Methods

<a id="dispatch"></a>

###  dispatch

▸ **dispatch**(event: *`any` |`any`[]*): `Observable`<`any`>

*Defined in [store.ts:16](https://github.com/amcdnl/ngxs/blob/4ba1032/packages/store/src/store.ts#L16)*

Dispatches event(s).

**Parameters:**

| Param | Type |
| ------ | ------ |
| event | `any` |
`any`[]
 | 

**Returns:** `Observable`<`any`>

___
<a id="reset"></a>

###  reset

▸ **reset**(state: *`any`*): `any`

*Defined in [store.ts:79](https://github.com/amcdnl/ngxs/blob/4ba1032/packages/store/src/store.ts#L79)*

Reset the state to a specific point in time. This method is useful for plugin's who need to modify the state directly or unit testing.

**Parameters:**

| Param | Type |
| ------ | ------ |
| state | `any` | 

**Returns:** `any`

___
<a id="select"></a>

###  select

▸ **select**T(selector: *`function`*): `Observable`<`T`>

▸ **select**(selector: *`string` |`any`*): `Observable`<`any`>

*Defined in [store.ts:23](https://github.com/amcdnl/ngxs/blob/4ba1032/packages/store/src/store.ts#L23)*

Selects a slice of data from the store.

**Type parameters:**

#### T 
**Parameters:**

| Param | Type |
| ------ | ------ |
| selector | `function` | 

**Returns:** `Observable`<`T`>

*Defined in [store.ts:24](https://github.com/amcdnl/ngxs/blob/4ba1032/packages/store/src/store.ts#L24)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| selector | `string` |
`any`
 | 

**Returns:** `Observable`<`any`>

___
<a id="selectonce"></a>

###  selectOnce

▸ **selectOnce**T(selector: *`function`*): `Observable`<`T`>

▸ **selectOnce**(selector: *`string` |`any`*): `Observable`<`any`>

*Defined in [store.ts:45](https://github.com/amcdnl/ngxs/blob/4ba1032/packages/store/src/store.ts#L45)*

Select one slice of data from the store.

**Type parameters:**

#### T 
**Parameters:**

| Param | Type |
| ------ | ------ |
| selector | `function` | 

**Returns:** `Observable`<`T`>

*Defined in [store.ts:46](https://github.com/amcdnl/ngxs/blob/4ba1032/packages/store/src/store.ts#L46)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| selector | `string` |
`any`
 | 

**Returns:** `Observable`<`any`>

___
<a id="selectsnapshot"></a>

###  selectSnapshot

▸ **selectSnapshot**T(selector: *`function`*): `T`

▸ **selectSnapshot**(selector: *`string` |`any`*): `any`

*Defined in [store.ts:54](https://github.com/amcdnl/ngxs/blob/4ba1032/packages/store/src/store.ts#L54)*

Select a snapshot from the state.

**Type parameters:**

#### T 
**Parameters:**

| Param | Type |
| ------ | ------ |
| selector | `function` | 

**Returns:** `T`

*Defined in [store.ts:55](https://github.com/amcdnl/ngxs/blob/4ba1032/packages/store/src/store.ts#L55)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| selector | `string` |
`any`
 | 

**Returns:** `any`

___
<a id="snapshot"></a>

###  snapshot

▸ **snapshot**(): `any`

*Defined in [store.ts:71](https://github.com/amcdnl/ngxs/blob/4ba1032/packages/store/src/store.ts#L71)*

Return the raw value of the state.

**Returns:** `any`

___
<a id="subscribe"></a>

###  subscribe

▸ **subscribe**(fn?: *`any`*): `Subscription`

*Defined in [store.ts:64](https://github.com/amcdnl/ngxs/blob/4ba1032/packages/store/src/store.ts#L64)*

Allow the user to subscribe to the root of the state

**Parameters:**

| Param | Type |
| ------ | ------ |
| `Optional` fn | `any` | 

**Returns:** `Subscription`

___


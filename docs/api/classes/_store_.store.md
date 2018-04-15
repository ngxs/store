[API](../README.md) > ["store"](../modules/_store_.md) > [Store](../classes/_store_.store.md)

# Class: Store

## Index

### Constructors

* [constructor](_store_.store.md#constructor)

### Methods

* [dispatch](_store_.store.md#dispatch)
* [select](_store_.store.md#select)
* [selectOnce](_store_.store.md#selectonce)
* [selectSnapshot](_store_.store.md#selectsnapshot)
* [snapshot](_store_.store.md#snapshot)
* [subscribe](_store_.store.md#subscribe)

---

## Constructors
<a id="constructor"></a>

### ⊕ **new Store**(_errorHandler: *`ErrorHandler`*, _actions: *[InternalActions](_actions_stream_.internalactions.md)*, _storeFactory: *[StateFactory](_state_factory_.statefactory.md)*, _pluginManager: *[PluginManager](_plugin_manager_.pluginmanager.md)*, _stateStream: *[StateStream](_state_stream_.statestream.md)*): [Store](_store_.store.md)

*Defined in [store.ts:14](https://github.com/amcdnl/ngxs/blob/bb9eb5a/packages/store/src/store.ts#L14)*

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| _errorHandler | `ErrorHandler`   |  - |
| _actions | [InternalActions](_actions_stream_.internalactions.md)   |  - |
| _storeFactory | [StateFactory](_state_factory_.statefactory.md)   |  - |
| _pluginManager | [PluginManager](_plugin_manager_.pluginmanager.md)   |  - |
| _stateStream | [StateStream](_state_stream_.statestream.md)   |  - |

**Returns:** [Store](_store_.store.md)

---

## Methods
<a id="dispatch"></a>

###  dispatch

▸ **dispatch**(event: *`any`⎮`any`[]*): `Observable`.<`any`>

*Defined in [store.ts:26](https://github.com/amcdnl/ngxs/blob/bb9eb5a/packages/store/src/store.ts#L26)*

Dispatches event(s).

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| event | `any`⎮`any`[]   |  - |

**Returns:** `Observable`.<`any`>

___

<a id="select"></a>

###  select

▸ **select**T(selector: *`function`*): `Observable`.<`T`>

▸ **select**(selector: *`string`⎮`any`*): `Observable`.<`any`>

*Defined in [store.ts:51](https://github.com/amcdnl/ngxs/blob/bb9eb5a/packages/store/src/store.ts#L51)*

Selects a slice of data from the store.

**Type parameters:**

#### T 
**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| selector | `function`   |  - |

**Returns:** `Observable`.<`T`>

*Defined in [store.ts:52](https://github.com/amcdnl/ngxs/blob/bb9eb5a/packages/store/src/store.ts#L52)*

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| selector | `string`⎮`any`   |  - |

**Returns:** `Observable`.<`any`>

___

<a id="selectonce"></a>

###  selectOnce

▸ **selectOnce**T(selector: *`function`*): `Observable`.<`T`>

▸ **selectOnce**(selector: *`string`⎮`any`*): `Observable`.<`any`>

*Defined in [store.ts:77](https://github.com/amcdnl/ngxs/blob/bb9eb5a/packages/store/src/store.ts#L77)*

Select one slice of data from the store.

**Type parameters:**

#### T 
**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| selector | `function`   |  - |

**Returns:** `Observable`.<`T`>

*Defined in [store.ts:78](https://github.com/amcdnl/ngxs/blob/bb9eb5a/packages/store/src/store.ts#L78)*

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| selector | `string`⎮`any`   |  - |

**Returns:** `Observable`.<`any`>

___

<a id="selectsnapshot"></a>

###  selectSnapshot

▸ **selectSnapshot**T(selector: *`function`*): `T`

*Defined in [store.ts:86](https://github.com/amcdnl/ngxs/blob/bb9eb5a/packages/store/src/store.ts#L86)*

Select a snapshot from the state.

**Type parameters:**

#### T 
**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| selector | `function`   |  - |

**Returns:** `T`

___

<a id="snapshot"></a>

###  snapshot

▸ **snapshot**(): `any`

*Defined in [store.ts:100](https://github.com/amcdnl/ngxs/blob/bb9eb5a/packages/store/src/store.ts#L100)*

Return the raw value of the state.

**Returns:** `any`

___

<a id="subscribe"></a>

###  subscribe

▸ **subscribe**(fn?: *`any`*): `Subscription`

*Defined in [store.ts:93](https://github.com/amcdnl/ngxs/blob/bb9eb5a/packages/store/src/store.ts#L93)*

Allow the user to subscribe to the root of the state

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| fn | `any`   |  - |

**Returns:** `Subscription`

___


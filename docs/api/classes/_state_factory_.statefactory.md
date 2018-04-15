[API](../README.md) > ["state-factory"](../modules/_state_factory_.md) > [StateFactory](../classes/_state_factory_.statefactory.md)

# Class: StateFactory

State factory class
*__ignore__*: 

## Index

### Constructors

* [constructor](_state_factory_.statefactory.md#constructor)

### Accessors

* [states](_state_factory_.statefactory.md#states)

### Methods

* [add](_state_factory_.statefactory.md#add)
* [addAndReturnDefaults](_state_factory_.statefactory.md#addandreturndefaults)
* [invokeActions](_state_factory_.statefactory.md#invokeactions)
* [invokeInit](_state_factory_.statefactory.md#invokeinit)

---

## Constructors
<a id="constructor"></a>

### ⊕ **new StateFactory**(_injector: *`Injector`*, _parentFactory: *[StateFactory](_state_factory_.statefactory.md)*): [StateFactory](_state_factory_.statefactory.md)

*Defined in [state-factory.ts:20](https://github.com/amcdnl/ngxs/blob/bb9eb5a/packages/store/src/state-factory.ts#L20)*

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| _injector | `Injector`   |  - |
| _parentFactory | [StateFactory](_state_factory_.statefactory.md)   |  - |

**Returns:** [StateFactory](_state_factory_.statefactory.md)

---

## Accessors
<a id="states"></a>

###  states

getstates(): [MetaDataModel](../interfaces/_internals_.metadatamodel.md)[]

*Defined in [state-factory.ts:16](https://github.com/amcdnl/ngxs/blob/bb9eb5a/packages/store/src/state-factory.ts#L16)*

**Returns:** [MetaDataModel](../interfaces/_internals_.metadatamodel.md)[]

___

## Methods
<a id="add"></a>

###  add

▸ **add**(states: *`any`⎮`any`[]*): `any`[]

*Defined in [state-factory.ts:32](https://github.com/amcdnl/ngxs/blob/bb9eb5a/packages/store/src/state-factory.ts#L32)*

Add a new state to the global defs.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| states | `any`⎮`any`[]   |  - |

**Returns:** `any`[]

___

<a id="addandreturndefaults"></a>

###  addAndReturnDefaults

▸ **addAndReturnDefaults**(stateKlasses: *`any`[]*): `object`

*Defined in [state-factory.ts:91](https://github.com/amcdnl/ngxs/blob/bb9eb5a/packages/store/src/state-factory.ts#L91)*

Add a set of states to the store and return the defaulsts

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| stateKlasses | `any`[]   |  - |

**Returns:** `object`

___

<a id="invokeactions"></a>

###  invokeActions

▸ **invokeActions**(getState: *`any`*, setState: *`any`*, dispatch: *`any`*, actions$: *`any`*, action: *`any`*): `Observable`.<`any`[]>

*Defined in [state-factory.ts:117](https://github.com/amcdnl/ngxs/blob/bb9eb5a/packages/store/src/state-factory.ts#L117)*

Invoke actions on the states.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| getState | `any`   |  - |
| setState | `any`   |  - |
| dispatch | `any`   |  - |
| actions$ | `any`   |  - |
| action | `any`   |  - |

**Returns:** `Observable`.<`any`[]>

___

<a id="invokeinit"></a>

###  invokeInit

▸ **invokeInit**(getState: *`any`*, setState: *`any`*, dispatch: *`any`*, stateMetadatas: *`any`*): `void`

*Defined in [state-factory.ts:102](https://github.com/amcdnl/ngxs/blob/bb9eb5a/packages/store/src/state-factory.ts#L102)*

Invoke the init function on the states.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| getState | `any`   |  - |
| setState | `any`   |  - |
| dispatch | `any`   |  - |
| stateMetadatas | `any`   |  - |

**Returns:** `void`

___


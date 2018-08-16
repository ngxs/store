[API](../README.md) > ["state-factory"](../modules/_state_factory_.md) > [StateFactory](../classes/_state_factory_.statefactory.md)

# Class: StateFactory

State factory class
*__ignore__*: 

## Hierarchy

**StateFactory**

## Index

### Constructors

* [constructor](_state_factory_.statefactory.md#constructor)

### Accessors

* [states](_state_factory_.statefactory.md#states)

### Methods

* [add](_state_factory_.statefactory.md#add)
* [addAndReturnDefaults](_state_factory_.statefactory.md#addandreturndefaults)
* [connectActionHandlers](_state_factory_.statefactory.md#connectactionhandlers)
* [invokeActions](_state_factory_.statefactory.md#invokeactions)
* [invokeInit](_state_factory_.statefactory.md#invokeinit)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new StateFactory**(_injector: *`Injector`*, _parentFactory: *[StateFactory](_state_factory_.statefactory.md)*, _actions: *[InternalActions](_actions_stream_.internalactions.md)*, _actionResults: *[InternalDispatchedActionResults](_dispatcher_.internaldispatchedactionresults.md)*, _stateContextFactory: *[StateContextFactory](_state_context_factory_.statecontextfactory.md)*): [StateFactory](_state_factory_.statefactory.md)

*Defined in [state-factory.ts:32](https://github.com/amcdnl/ngxs/blob/4ba1032/packages/store/src/state-factory.ts#L32)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| _injector | `Injector` | 
| _parentFactory | [StateFactory](_state_factory_.statefactory.md) | 
| _actions | [InternalActions](_actions_stream_.internalactions.md) | 
| _actionResults | [InternalDispatchedActionResults](_dispatcher_.internaldispatchedactionresults.md) | 
| _stateContextFactory | [StateContextFactory](_state_context_factory_.statecontextfactory.md) | 

**Returns:** [StateFactory](_state_factory_.statefactory.md)

___

## Accessors

<a id="states"></a>

###  states

getstates(): [MappedStore](../interfaces/_internals_.mappedstore.md)[]

*Defined in [state-factory.ts:27](https://github.com/amcdnl/ngxs/blob/4ba1032/packages/store/src/state-factory.ts#L27)*

**Returns:** [MappedStore](../interfaces/_internals_.mappedstore.md)[]

___

## Methods

<a id="add"></a>

###  add

▸ **add**(oneOrManyStateClasses: *[StateClass](../interfaces/_internals_.stateclass.md) |[StateClass](../interfaces/_internals_.stateclass.md)[]*): [MappedStore](../interfaces/_internals_.mappedstore.md)[]

*Defined in [state-factory.ts:47](https://github.com/amcdnl/ngxs/blob/4ba1032/packages/store/src/state-factory.ts#L47)*

Add a new state to the global defs.

**Parameters:**

| Param | Type |
| ------ | ------ |
| oneOrManyStateClasses | [StateClass](../interfaces/_internals_.stateclass.md) |
[StateClass](../interfaces/_internals_.stateclass.md)[]
 | 

**Returns:** [MappedStore](../interfaces/_internals_.mappedstore.md)[]

___
<a id="addandreturndefaults"></a>

###  addAndReturnDefaults

▸ **addAndReturnDefaults**(stateClasses: *`any`[]*): `object`

*Defined in [state-factory.ts:108](https://github.com/amcdnl/ngxs/blob/4ba1032/packages/store/src/state-factory.ts#L108)*

Add a set of states to the store and return the defaulsts

**Parameters:**

| Param | Type |
| ------ | ------ |
| stateClasses | `any`[] | 

**Returns:** `object`

___
<a id="connectactionhandlers"></a>

###  connectActionHandlers

▸ **connectActionHandlers**(): `void`

*Defined in [state-factory.ts:122](https://github.com/amcdnl/ngxs/blob/4ba1032/packages/store/src/state-factory.ts#L122)*

Bind the actions to the handlers

**Returns:** `void`

___
<a id="invokeactions"></a>

###  invokeActions

▸ **invokeActions**(actions$: *[InternalActions](_actions_stream_.internalactions.md)*, action: *`any`*): `Observable`<`any`[]>

*Defined in [state-factory.ts:156](https://github.com/amcdnl/ngxs/blob/4ba1032/packages/store/src/state-factory.ts#L156)*

Invoke actions on the states.

**Parameters:**

| Param | Type |
| ------ | ------ |
| actions$ | [InternalActions](_actions_stream_.internalactions.md) | 
| action | `any` | 

**Returns:** `Observable`<`any`[]>

___
<a id="invokeinit"></a>

###  invokeInit

▸ **invokeInit**(stateMetadatas: *[MappedStore](../interfaces/_internals_.mappedstore.md)[]*): `void`

*Defined in [state-factory.ts:142](https://github.com/amcdnl/ngxs/blob/4ba1032/packages/store/src/state-factory.ts#L142)*

Invoke the init function on the states.

**Parameters:**

| Param | Type |
| ------ | ------ |
| stateMetadatas | [MappedStore](../interfaces/_internals_.mappedstore.md)[] | 

**Returns:** `void`

___


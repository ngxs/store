[API](../README.md) > ["state-operations"](../modules/_state_operations_.md) > [InternalStateOperations](../classes/_state_operations_.internalstateoperations.md)

# Class: InternalStateOperations

State Context factory class
*__ignore__*: 

## Hierarchy

**InternalStateOperations**

## Index

### Constructors

* [constructor](_state_operations_.internalstateoperations.md#constructor)

### Methods

* [getRootStateOperations](_state_operations_.internalstateoperations.md#getrootstateoperations)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new InternalStateOperations**(_stateStream: *[StateStream](_state_stream_.statestream.md)*, _dispatcher: *[InternalDispatcher](_dispatcher_.internaldispatcher.md)*, _config: *[NgxsConfig](_symbols_.ngxsconfig.md)*): [InternalStateOperations](_state_operations_.internalstateoperations.md)

*Defined in [state-operations.ts:15](https://github.com/amcdnl/ngxs/blob/4ba1032/packages/store/src/state-operations.ts#L15)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| _stateStream | [StateStream](_state_stream_.statestream.md) | 
| _dispatcher | [InternalDispatcher](_dispatcher_.internaldispatcher.md) | 
| _config | [NgxsConfig](_symbols_.ngxsconfig.md) | 

**Returns:** [InternalStateOperations](_state_operations_.internalstateoperations.md)

___

## Methods

<a id="getrootstateoperations"></a>

###  getRootStateOperations

▸ **getRootStateOperations**(): [StateOperations](../interfaces/_internals_.stateoperations.md)<`any`>

*Defined in [state-operations.ts:22](https://github.com/amcdnl/ngxs/blob/4ba1032/packages/store/src/state-operations.ts#L22)*

**Returns:** [StateOperations](../interfaces/_internals_.stateoperations.md)<`any`>

___


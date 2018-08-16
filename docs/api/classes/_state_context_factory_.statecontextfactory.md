[API](../README.md) > ["state-context-factory"](../modules/_state_context_factory_.md) > [StateContextFactory](../classes/_state_context_factory_.statecontextfactory.md)

# Class: StateContextFactory

State Context factory class
*__ignore__*: 

## Hierarchy

**StateContextFactory**

## Index

### Constructors

* [constructor](_state_context_factory_.statecontextfactory.md#constructor)

### Methods

* [createStateContext](_state_context_factory_.statecontextfactory.md#createstatecontext)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new StateContextFactory**(_internalStateOperations: *[InternalStateOperations](_state_operations_.internalstateoperations.md)*): [StateContextFactory](_state_context_factory_.statecontextfactory.md)

*Defined in [state-context-factory.ts:14](https://github.com/amcdnl/ngxs/blob/4ba1032/packages/store/src/state-context-factory.ts#L14)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| _internalStateOperations | [InternalStateOperations](_state_operations_.internalstateoperations.md) | 

**Returns:** [StateContextFactory](_state_context_factory_.statecontextfactory.md)

___

## Methods

<a id="createstatecontext"></a>

###  createStateContext

▸ **createStateContext**(metadata: *[MappedStore](../interfaces/_internals_.mappedstore.md)*): [StateContext](../interfaces/_symbols_.statecontext.md)<`any`>

*Defined in [state-context-factory.ts:22](https://github.com/amcdnl/ngxs/blob/4ba1032/packages/store/src/state-context-factory.ts#L22)*

Create the state context

**Parameters:**

| Param | Type |
| ------ | ------ |
| metadata | [MappedStore](../interfaces/_internals_.mappedstore.md) | 

**Returns:** [StateContext](../interfaces/_symbols_.statecontext.md)<`any`>

___


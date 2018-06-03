[API](../README.md) > ["dispatcher"](../modules/_dispatcher_.md) > [InternalDispatcher](../classes/_dispatcher_.internaldispatcher.md)

# Class: InternalDispatcher

## Hierarchy

**InternalDispatcher**

## Index

### Constructors

* [constructor](_dispatcher_.internaldispatcher.md#constructor)

### Methods

* [dispatch](_dispatcher_.internaldispatcher.md#dispatch)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new InternalDispatcher**(_errorHandler: *`ErrorHandler`*, _actions: *[InternalActions](_actions_stream_.internalactions.md)*, _actionResults: *[InternalDispatchedActionResults](_dispatcher_.internaldispatchedactionresults.md)*, _pluginManager: *[PluginManager](_plugin_manager_.pluginmanager.md)*, _stateStream: *[StateStream](_state_stream_.statestream.md)*, _ngZone: *`NgZone`*): [InternalDispatcher](_dispatcher_.internaldispatcher.md)

*Defined in [dispatcher.ts:21](https://github.com/amcdnl/ngxs/blob/4ba1032/packages/store/src/dispatcher.ts#L21)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| _errorHandler | `ErrorHandler` | 
| _actions | [InternalActions](_actions_stream_.internalactions.md) | 
| _actionResults | [InternalDispatchedActionResults](_dispatcher_.internaldispatchedactionresults.md) | 
| _pluginManager | [PluginManager](_plugin_manager_.pluginmanager.md) | 
| _stateStream | [StateStream](_state_stream_.statestream.md) | 
| _ngZone | `NgZone` | 

**Returns:** [InternalDispatcher](_dispatcher_.internaldispatcher.md)

___

## Methods

<a id="dispatch"></a>

###  dispatch

▸ **dispatch**(event: *`any` |`any`[]*): `Observable`<`any`>

*Defined in [dispatcher.ts:34](https://github.com/amcdnl/ngxs/blob/4ba1032/packages/store/src/dispatcher.ts#L34)*

Dispatches event(s).

**Parameters:**

| Param | Type |
| ------ | ------ |
| event | `any` |
`any`[]
 | 

**Returns:** `Observable`<`any`>

___


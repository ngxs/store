[API](../README.md) > ["internal/dispatcher"](../modules/_internal_dispatcher_.md) > [InternalDispatcher](../classes/_internal_dispatcher_.internaldispatcher.md)

# Class: InternalDispatcher

## Hierarchy

**InternalDispatcher**

## Index

### Constructors

* [constructor](_internal_dispatcher_.internaldispatcher.md#constructor)

### Methods

* [dispatch](_internal_dispatcher_.internaldispatcher.md#dispatch)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new InternalDispatcher**(_errorHandler: *`ErrorHandler`*, _actions: *[InternalActions](_actions_stream_.internalactions.md)*, _actionResults: *[InternalDispatchedActionResults](_internal_dispatcher_.internaldispatchedactionresults.md)*, _pluginManager: *`PluginManager`*, _stateStream: *`StateStream`*, _ngZone: *`NgZone`*): [InternalDispatcher](_internal_dispatcher_.internaldispatcher.md)

*Defined in [internal/dispatcher.ts:21](https://github.com/ngxs/store/blob/7d8137d/packages/store/src/internal/dispatcher.ts#L21)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| _errorHandler | `ErrorHandler` |
| _actions | [InternalActions](_actions_stream_.internalactions.md) |
| _actionResults | [InternalDispatchedActionResults](_internal_dispatcher_.internaldispatchedactionresults.md) |
| _pluginManager | `PluginManager` |
| _stateStream | `StateStream` |
| _ngZone | `NgZone` |

**Returns:** [InternalDispatcher](_internal_dispatcher_.internaldispatcher.md)

___

## Methods

<a id="dispatch"></a>

###  dispatch

▸ **dispatch**(event: * `any` &#124; `any`[]*): `Observable`<`any`>

*Defined in [internal/dispatcher.ts:34](https://github.com/ngxs/store/blob/7d8137d/packages/store/src/internal/dispatcher.ts#L34)*

Dispatches event(s).

**Parameters:**

| Name | Type |
| ------ | ------ |
| event |  `any` &#124; `any`[]|

**Returns:** `Observable`<`any`>

___


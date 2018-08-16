[API](../README.md) > ["symbols"](../modules/_symbols_.md) > [StoreOptions](../interfaces/_symbols_.storeoptions.md)

# Interface: StoreOptions

Options that can be provided to the store.

## Type parameters
#### T 
## Hierarchy

**StoreOptions**

## Index

### Properties

* [children](_symbols_.storeoptions.md#children)
* [defaults](_symbols_.storeoptions.md#defaults)
* [name](_symbols_.storeoptions.md#name)

---

## Properties

<a id="children"></a>

### `<Optional>` children

**● children**: *`any`[]*

*Defined in [symbols.ts:78](https://github.com/amcdnl/ngxs/blob/4ba1032/packages/store/src/symbols.ts#L78)*

Sub states for the given state.

___
<a id="defaults"></a>

### `<Optional>` defaults

**● defaults**: *`T`*

*Defined in [symbols.ts:73](https://github.com/amcdnl/ngxs/blob/4ba1032/packages/store/src/symbols.ts#L73)*

Default values for the state. If not provided, uses empty object.

___
<a id="name"></a>

###  name

**● name**: *`string`*

*Defined in [symbols.ts:68](https://github.com/amcdnl/ngxs/blob/4ba1032/packages/store/src/symbols.ts#L68)*

Name of the state. Required.

___


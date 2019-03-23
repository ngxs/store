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

*Defined in [symbols.ts:93](https://github.com/ngxs/store/blob/7d8137d/packages/store/src/symbols.ts#L93)*

Sub states for the given state.

___
<a id="defaults"></a>

### `<Optional>` defaults

**● defaults**: *`T`*

*Defined in [symbols.ts:88](https://github.com/ngxs/store/blob/7d8137d/packages/store/src/symbols.ts#L88)*

Default values for the state. If not provided, uses empty object.

___
<a id="name"></a>

###  name

**● name**: *`string`*

*Defined in [symbols.ts:83](https://github.com/ngxs/store/blob/7d8137d/packages/store/src/symbols.ts#L83)*

Name of the state. Required.

___


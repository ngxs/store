[API](../README.md) > ["symbols"](../modules/_symbols_.md) > [NgxsPlugin](../interfaces/_symbols_.ngxsplugin.md)

# Interface: NgxsPlugin

Plugin interface

## Hierarchy

**NgxsPlugin**

## Index

### Methods

* [handle](_symbols_.ngxsplugin.md#handle)

---

## Methods

<a id="handle"></a>

###  handle

▸ **handle**(state: *`any`*, action: *`any`*, next: *[NgxsNextPluginFn](../modules/_symbols_.md#ngxsnextpluginfn)*): `any`

*Defined in [symbols.ts:58](https://github.com/amcdnl/ngxs/blob/4ba1032/packages/store/src/symbols.ts#L58)*

Handle the state/action before its submitted to the state handlers.

**Parameters:**

| Param | Type |
| ------ | ------ |
| state | `any` | 
| action | `any` | 
| next | [NgxsNextPluginFn](../modules/_symbols_.md#ngxsnextpluginfn) | 

**Returns:** `any`

___


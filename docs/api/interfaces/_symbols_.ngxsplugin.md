[API](../README.md) > ["symbols"](../modules/_symbols_.md) > [NgxsPlugin](../interfaces/_symbols_.ngxsplugin.md)

# Interface: NgxsPlugin

Plugin interface

## Methods
<a id="handle"></a>

###  handle

▸ **handle**(state: *`any`*, action: *`any`*, next: *[NgxsNextPluginFn](../modules/_symbols_.md#ngxsnextpluginfn)*): `any`

*Defined in [symbols.ts:46](https://github.com/amcdnl/ngxs/blob/bb9eb5a/packages/store/src/symbols.ts#L46)*

Handle the state/action before its submitted to the state handlers.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| state | `any`   |  - |
| action | `any`   |  - |
| next | [NgxsNextPluginFn](../modules/_symbols_.md#ngxsnextpluginfn)   |  - |

**Returns:** `any`

___


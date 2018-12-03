[API](../README.md) > ["symbols"](../modules/_symbols_.md)

# External module: "symbols"

## Index

### Classes

* [NgxsConfig](../classes/_symbols_.ngxsconfig.md)

### Interfaces

* [ActionOptions](../interfaces/_symbols_.actionoptions.md)
* [NgxsOnInit](../interfaces/_symbols_.ngxsoninit.md)
* [NgxsPlugin](../interfaces/_symbols_.ngxsplugin.md)
* [StateContext](../interfaces/_symbols_.statecontext.md)
* [StoreOptions](../interfaces/_symbols_.storeoptions.md)

### Type aliases

* [NgxsLifeCycle](_symbols_.md#ngxslifecycle)
* [NgxsNextPluginFn](_symbols_.md#ngxsnextpluginfn)
* [NgxsPluginConstructor](_symbols_.md#ngxspluginconstructor)
* [NgxsPluginFn](_symbols_.md#ngxspluginfn)

### Variables

* [FEATURE_STATE_TOKEN](_symbols_.md#feature_state_token)
* [META_KEY](_symbols_.md#meta_key)
* [NGXS_PLUGINS](_symbols_.md#ngxs_plugins)
* [ROOT_STATE_TOKEN](_symbols_.md#root_state_token)
* [SELECTOR_META_KEY](_symbols_.md#selector_meta_key)

---

## Type aliases

<a id="ngxslifecycle"></a>

###  NgxsLifeCycle

**Ƭ NgxsLifeCycle**: *`Partial`<[NgxsOnInit](../interfaces/_symbols_.ngxsoninit.md)>*

*Defined in [symbols.ts:113](https://github.com/ngxs/store/blob/7d8137d/packages/store/src/symbols.ts#L113)*

___
<a id="ngxsnextpluginfn"></a>

###  NgxsNextPluginFn

**Ƭ NgxsNextPluginFn**: *`function`*

*Defined in [symbols.ts:64](https://github.com/ngxs/store/blob/7d8137d/packages/store/src/symbols.ts#L64)*

#### Type declaration
▸(state: *`any`*, mutation: *`any`*): `any`

**Parameters:**

| Name | Type |
| ------ | ------ |
| state | `any` |
| mutation | `any` |

**Returns:** `any`

___
<a id="ngxspluginconstructor"></a>

###  NgxsPluginConstructor

**Ƭ NgxsPluginConstructor**: *`object`*

*Defined in [symbols.ts:10](https://github.com/ngxs/store/blob/7d8137d/packages/store/src/symbols.ts#L10)*

#### Type declaration

___
<a id="ngxspluginfn"></a>

###  NgxsPluginFn

**Ƭ NgxsPluginFn**: *`function`*

*Defined in [symbols.ts:11](https://github.com/ngxs/store/blob/7d8137d/packages/store/src/symbols.ts#L11)*

#### Type declaration
▸(state: *`any`*, mutation: *`any`*, next: *[NgxsNextPluginFn](_symbols_.md#ngxsnextpluginfn)*): `any`

**Parameters:**

| Name | Type |
| ------ | ------ |
| state | `any` |
| mutation | `any` |
| next | [NgxsNextPluginFn](_symbols_.md#ngxsnextpluginfn) |

**Returns:** `any`

___

## Variables

<a id="feature_state_token"></a>

### `<Const>` FEATURE_STATE_TOKEN

**● FEATURE_STATE_TOKEN**: *`InjectionToken`<`any`>* =  new InjectionToken<any>('FEATURE_STATE_TOKEN')

*Defined in [symbols.ts:5](https://github.com/ngxs/store/blob/7d8137d/packages/store/src/symbols.ts#L5)*

___
<a id="meta_key"></a>

### `<Const>` META_KEY

**● META_KEY**: *"NGXS_META"* = "NGXS_META"

*Defined in [symbols.ts:6](https://github.com/ngxs/store/blob/7d8137d/packages/store/src/symbols.ts#L6)*

___
<a id="ngxs_plugins"></a>

### `<Const>` NGXS_PLUGINS

**● NGXS_PLUGINS**: *`InjectionToken`<`Object`>* =  new InjectionToken('NGXS_PLUGINS')

*Defined in [symbols.ts:9](https://github.com/ngxs/store/blob/7d8137d/packages/store/src/symbols.ts#L9)*

___
<a id="root_state_token"></a>

### `<Const>` ROOT_STATE_TOKEN

**● ROOT_STATE_TOKEN**: *`InjectionToken`<`any`>* =  new InjectionToken<any>('ROOT_STATE_TOKEN')

*Defined in [symbols.ts:4](https://github.com/ngxs/store/blob/7d8137d/packages/store/src/symbols.ts#L4)*

___
<a id="selector_meta_key"></a>

### `<Const>` SELECTOR_META_KEY

**● SELECTOR_META_KEY**: *"NGXS_SELECTOR_META"* = "NGXS_SELECTOR_META"

*Defined in [symbols.ts:7](https://github.com/ngxs/store/blob/7d8137d/packages/store/src/symbols.ts#L7)*

___


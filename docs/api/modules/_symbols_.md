[API](../README.md) > ["symbols"](../modules/_symbols_.md)

# External module: "symbols"

## Index

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

---

## Type aliases
<a id="ngxslifecycle"></a>

###  NgxsLifeCycle

**Τ NgxsLifeCycle**:  *`Partial`.<[NgxsOnInit](../interfaces/_symbols_.ngxsoninit.md)>* 

*Defined in [symbols.ts:89](https://github.com/amcdnl/ngxs/blob/bb9eb5a/packages/store/src/symbols.ts#L89)*

___

<a id="ngxsnextpluginfn"></a>

###  NgxsNextPluginFn

**Τ NgxsNextPluginFn**:  *`function`* 

*Defined in [symbols.ts:37](https://github.com/amcdnl/ngxs/blob/bb9eb5a/packages/store/src/symbols.ts#L37)*

#### Type declaration
▸(state: *`any`*, mutation: *`any`*): `any`

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| state | `any`   |  - |
| mutation | `any`   |  - |

**Returns:** `any`

___

<a id="ngxspluginconstructor"></a>

###  NgxsPluginConstructor

**Τ NgxsPluginConstructor**:  *`object`* 

*Defined in [symbols.ts:9](https://github.com/amcdnl/ngxs/blob/bb9eb5a/packages/store/src/symbols.ts#L9)*

#### Type declaration

___

<a id="ngxspluginfn"></a>

###  NgxsPluginFn

**Τ NgxsPluginFn**:  *`function`* 

*Defined in [symbols.ts:10](https://github.com/amcdnl/ngxs/blob/bb9eb5a/packages/store/src/symbols.ts#L10)*

#### Type declaration
▸(state: *`any`*, mutation: *`any`*, next: *[NgxsNextPluginFn](_symbols_.md#ngxsnextpluginfn)*): `any`

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| state | `any`   |  - |
| mutation | `any`   |  - |
| next | [NgxsNextPluginFn](_symbols_.md#ngxsnextpluginfn)   |  - |

**Returns:** `any`

___

## Variables
<a id="feature_state_token"></a>

### `<Const>` FEATURE_STATE_TOKEN

**●  FEATURE_STATE_TOKEN**:  *`InjectionToken`.<`any`>*  =  new InjectionToken<any>('FEATURE_STATE_TOKEN')

*Defined in [symbols.ts:5](https://github.com/amcdnl/ngxs/blob/bb9eb5a/packages/store/src/symbols.ts#L5)*

___

<a id="meta_key"></a>

### `<Const>` META_KEY

**●  META_KEY**:  *"NGXS_META"*  = "NGXS_META"

*Defined in [symbols.ts:6](https://github.com/amcdnl/ngxs/blob/bb9eb5a/packages/store/src/symbols.ts#L6)*

___

<a id="ngxs_plugins"></a>

### `<Const>` NGXS_PLUGINS

**●  NGXS_PLUGINS**:  *`InjectionToken`.<`Object`>*  =  new InjectionToken('NGXS_PLUGINS')

*Defined in [symbols.ts:8](https://github.com/amcdnl/ngxs/blob/bb9eb5a/packages/store/src/symbols.ts#L8)*

___

<a id="root_state_token"></a>

### `<Const>` ROOT_STATE_TOKEN

**●  ROOT_STATE_TOKEN**:  *`InjectionToken`.<`any`>*  =  new InjectionToken<any>('ROOT_STATE_TOKEN')

*Defined in [symbols.ts:4](https://github.com/amcdnl/ngxs/blob/bb9eb5a/packages/store/src/symbols.ts#L4)*

___


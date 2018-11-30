[API](../README.md) > ["symbols"](../modules/_symbols_.md) > [NgxsConfig](../classes/_symbols_.ngxsconfig.md)

# Class: NgxsConfig

The NGXS config settings.

## Hierarchy

**NgxsConfig**

## Index

### Constructors

* [constructor](_symbols_.ngxsconfig.md#constructor)

### Properties

* [compatibility](_symbols_.ngxsconfig.md#compatibility)
* [developmentMode](_symbols_.ngxsconfig.md#developmentmode)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new NgxsConfig**(): [NgxsConfig](_symbols_.ngxsconfig.md)

*Defined in [symbols.ts:30](https://github.com/ngxs/store/blob/7d8137d/packages/store/src/symbols.ts#L30)*

**Returns:** [NgxsConfig](_symbols_.ngxsconfig.md)

___

## Properties

<a id="compatibility"></a>

###  compatibility

**● compatibility**: *`object`*

*Defined in [symbols.ts:23](https://github.com/ngxs/store/blob/7d8137d/packages/store/src/symbols.ts#L23)*

#### Type declaration

 strictContentSecurityPolicy: `boolean`

Support a strict Content Security Policy. This will cirumvent some optimisations that violate a strict CSP through the use of `new Function(...)`. (default: false)

___
<a id="developmentmode"></a>

###  developmentMode

**● developmentMode**: *`boolean`*

*Defined in [symbols.ts:22](https://github.com/ngxs/store/blob/7d8137d/packages/store/src/symbols.ts#L22)*

Run in development mode. This will add additional debugging features:

*   Object.freeze on the state and actions to guarantee immutability (default: false)

___


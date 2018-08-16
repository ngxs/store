[API](../README.md) > ["memoize"](../modules/_memoize_.md)

# External module: "memoize"

## Index

### Functions

* [areArgumentsShallowlyEqual](_memoize_.md#areargumentsshallowlyequal)
* [defaultEqualityCheck](_memoize_.md#defaultequalitycheck)
* [memoize](_memoize_.md#memoize)

---

## Functions

<a id="areargumentsshallowlyequal"></a>

###  areArgumentsShallowlyEqual

▸ **areArgumentsShallowlyEqual**(equalityCheck: *`any`*, prev: *`any`*, next: *`any`*): `boolean`

*Defined in [memoize.ts:5](https://github.com/amcdnl/ngxs/blob/4ba1032/packages/store/src/memoize.ts#L5)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| equalityCheck | `any` | 
| prev | `any` | 
| next | `any` | 

**Returns:** `boolean`

___
<a id="defaultequalitycheck"></a>

###  defaultEqualityCheck

▸ **defaultEqualityCheck**(a: *`any`*, b: *`any`*): `boolean`

*Defined in [memoize.ts:1](https://github.com/amcdnl/ngxs/blob/4ba1032/packages/store/src/memoize.ts#L1)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| a | `any` | 
| b | `any` | 

**Returns:** `boolean`

___
<a id="memoize"></a>

###  memoize

▸ **memoize**(func: *`any`*, equalityCheck?: *[defaultEqualityCheck](_memoize_.md#defaultequalitycheck)*): `function`

*Defined in [memoize.ts:27](https://github.com/amcdnl/ngxs/blob/4ba1032/packages/store/src/memoize.ts#L27)*

Memoize a function on its last inputs only. Oringinally from: [https://github.com/reduxjs/reselect/blob/master/src/index.js](https://github.com/reduxjs/reselect/blob/master/src/index.js)
*__ignore__*: 

**Parameters:**

| Param | Type | Default value |
| ------ | ------ | ------ |
| func | `any` | - | 
| `Default value` equalityCheck | [defaultEqualityCheck](_memoize_.md#defaultequalitycheck) |  defaultEqualityCheck | 

**Returns:** `function`

___


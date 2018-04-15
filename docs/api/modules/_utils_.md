[API](../README.md) > ["utils"](../modules/_utils_.md)

# External module: "utils"

## Index

### Functions

* [actionMatcher](_utils_.md#actionmatcher)
* [getActionTypeFromInstance](_utils_.md#getactiontypefrominstance)
* [getValue](_utils_.md#getvalue)
* [setValue](_utils_.md#setvalue)

---

## Functions
<a id="actionmatcher"></a>

###  actionMatcher

▸ **actionMatcher**(action1: *`any`*): `(Anonymous function)`

*Defined in [utils.ts:17](https://github.com/amcdnl/ngxs/blob/bb9eb5a/packages/store/src/utils.ts#L17)*

Matches a action
*__ignore__*: 

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| action1 | `any`   |  - |

**Returns:** `(Anonymous function)`

___

<a id="getactiontypefrominstance"></a>

###  getActionTypeFromInstance

▸ **getActionTypeFromInstance**(action: *`any`*): `string`

*Defined in [utils.ts:5](https://github.com/amcdnl/ngxs/blob/bb9eb5a/packages/store/src/utils.ts#L5)*

Returns the type from an action instance.
*__ignore__*: 

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| action | `any`   |  - |

**Returns:** `string`

___

<a id="getvalue"></a>

### `<Const>` getValue

▸ **getValue**(obj: *`any`*, prop: *`string`*): `any`

*Defined in [utils.ts:61](https://github.com/amcdnl/ngxs/blob/bb9eb5a/packages/store/src/utils.ts#L61)*

Get a deeply nested value. Example:

getValue({ foo: bar: \[\] }, 'foo.bar') //=> \[\]

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| obj | `any`   |  - |
| prop | `string`   |  - |

**Returns:** `any`

___

<a id="setvalue"></a>

### `<Const>` setValue

▸ **setValue**(obj: *`any`*, prop: *`string`*, val: *`any`*): `any`

*Defined in [utils.ts:35](https://github.com/amcdnl/ngxs/blob/bb9eb5a/packages/store/src/utils.ts#L35)*

Set a deeply nested value. Example:

setValue({ foo: { bar: { eat: false } } }, 'foo.bar.eat', true) //=> { foo: { bar: { eat: true } } }

While it traverses it also creates new objects from top down.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| obj | `any`   |  - |
| prop | `string`   |  - |
| val | `any`   |  - |

**Returns:** `any`

___


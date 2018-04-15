[API](../README.md) > ["internals"](../modules/_internals_.md)

# External module: "internals"

## Index

### Interfaces

* [MetaDataModel](../interfaces/_internals_.metadatamodel.md)

### Functions

* [buildGraph](_internals_.md#buildgraph)
* [ensureStoreMetadata](_internals_.md#ensurestoremetadata)
* [fastPropGetter](_internals_.md#fastpropgetter)
* [findFullParentPath](_internals_.md#findfullparentpath)
* [isObject](_internals_.md#isobject)
* [nameToState](_internals_.md#nametostate)
* [topologicalSort](_internals_.md#topologicalsort)

---

## Functions
<a id="buildgraph"></a>

###  buildGraph

▸ **buildGraph**(states: *`any`*): `any`

*Defined in [internals.ts:75](https://github.com/amcdnl/ngxs/blob/bb9eb5a/packages/store/src/internals.ts#L75)*

Given an array of states, it will return a object graph. Example: const states = \[ Cart, CartSaved, CartSavedItems \]

would return:

const graph = { cart: \['saved'\], saved: \['items'\], items: \[\] };
*__ignore__*: 

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| states | `any`   |  - |

**Returns:** `any`

___

<a id="ensurestoremetadata"></a>

###  ensureStoreMetadata

▸ **ensureStoreMetadata**(target: *`any`*): [MetaDataModel](../interfaces/_internals_.metadatamodel.md)

*Defined in [internals.ts:17](https://github.com/amcdnl/ngxs/blob/bb9eb5a/packages/store/src/internals.ts#L17)*

Ensures metadata is attached to the class and returns it.
*__ignore__*: 

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| target | `any`   |  - |

**Returns:** [MetaDataModel](../interfaces/_internals_.metadatamodel.md)

___

<a id="fastpropgetter"></a>

###  fastPropGetter

▸ **fastPropGetter**(paths: *`string`[]*): `function`

*Defined in [internals.ts:41](https://github.com/amcdnl/ngxs/blob/bb9eb5a/packages/store/src/internals.ts#L41)*

The generated function is faster than:

*   pluck (Observable operator)
*   memoize
*__ignore__*: 

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| paths | `string`[]   |  - |

**Returns:** `function`

___

<a id="findfullparentpath"></a>

###  findFullParentPath

▸ **findFullParentPath**(obj: *`any`*, newObj?: *`any`*): `any`

*Defined in [internals.ts:142](https://github.com/amcdnl/ngxs/blob/bb9eb5a/packages/store/src/internals.ts#L142)*

Given a object relationship graph will return the full path for the child items. Example:

const graph = { cart: \['saved'\], saved: \['items'\], items: \[\] };

would return:

const r = { cart: 'cart', saved: 'cart.saved', items: 'cart.saved.items' };
*__ignore__*: 

**Parameters:**

| Param | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| obj | `any`  | - |   - |
| newObj | `any`  |  {} |   - |

**Returns:** `any`

___

<a id="isobject"></a>

###  isObject

▸ **isObject**(obj: *`any`*): `boolean`

*Defined in [internals.ts:220](https://github.com/amcdnl/ngxs/blob/bb9eb5a/packages/store/src/internals.ts#L220)*

Returns if the parameter is a object or not.
*__ignore__*: 

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| obj | `any`   |  - |

**Returns:** `boolean`

___

<a id="nametostate"></a>

###  nameToState

▸ **nameToState**(states: *`any`*): `any`

*Defined in [internals.ts:110](https://github.com/amcdnl/ngxs/blob/bb9eb5a/packages/store/src/internals.ts#L110)*

Given a states array, returns object graph returning the name and state metadata. Example:

const graph = { cart: { metadata } };
*__ignore__*: 

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| states | `any`   |  - |

**Returns:** `any`

___

<a id="topologicalsort"></a>

###  topologicalSort

▸ **topologicalSort**(graph: *`any`*): `any`[]

*Defined in [internals.ts:182](https://github.com/amcdnl/ngxs/blob/bb9eb5a/packages/store/src/internals.ts#L182)*

Given a object graph, it will return the items topologically sorted Example:

const graph = { cart: \['saved'\], saved: \['items'\], items: \[\] };

would return:

const results = \[ 'items', 'saved', 'cart' \];
*__ignore__*: 

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| graph | `any`   |  - |

**Returns:** `any`[]

___


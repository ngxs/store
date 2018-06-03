[API](../README.md) > ["internals"](../modules/_internals_.md)

# External module: "internals"

## Index

### Interfaces

* [ActionHandlerMetaData](../interfaces/_internals_.actionhandlermetadata.md)
* [MappedStore](../interfaces/_internals_.mappedstore.md)
* [MetaDataModel](../interfaces/_internals_.metadatamodel.md)
* [ObjectKeyMap](../interfaces/_internals_.objectkeymap.md)
* [SelectorMetaDataModel](../interfaces/_internals_.selectormetadatamodel.md)
* [StateClass](../interfaces/_internals_.stateclass.md)
* [StateOperations](../interfaces/_internals_.stateoperations.md)

### Type aliases

* [SelectFromState](_internals_.md#selectfromstate)
* [StateKeyGraph](_internals_.md#statekeygraph)

### Functions

* [buildGraph](_internals_.md#buildgraph)
* [ensureSelectorMetadata](_internals_.md#ensureselectormetadata)
* [ensureStoreMetadata](_internals_.md#ensurestoremetadata)
* [fastPropGetter](_internals_.md#fastpropgetter)
* [findFullParentPath](_internals_.md#findfullparentpath)
* [isObject](_internals_.md#isobject)
* [nameToState](_internals_.md#nametostate)
* [topologicalSort](_internals_.md#topologicalsort)

---

## Type aliases

<a id="selectfromstate"></a>

###  SelectFromState

**ΤSelectFromState**: *`function`*

*Defined in [internals.ts:35](https://github.com/amcdnl/ngxs/blob/4ba1032/packages/store/src/internals.ts#L35)*

#### Type declaration
▸(state: *`any`*): `any`

**Parameters:**

| Param | Type |
| ------ | ------ |
| state | `any` | 

**Returns:** `any`

___
<a id="statekeygraph"></a>

###  StateKeyGraph

**ΤStateKeyGraph**: *[ObjectKeyMap](../interfaces/_internals_.objectkeymap.md)<`string`[]>*

*Defined in [internals.ts:12](https://github.com/amcdnl/ngxs/blob/4ba1032/packages/store/src/internals.ts#L12)*

___

## Functions

<a id="buildgraph"></a>

###  buildGraph

▸ **buildGraph**(stateClasses: *[StateClass](../interfaces/_internals_.stateclass.md)[]*): [StateKeyGraph](_internals_.md#statekeygraph)

*Defined in [internals.ts:133](https://github.com/amcdnl/ngxs/blob/4ba1032/packages/store/src/internals.ts#L133)*

Given an array of states, it will return a object graph. Example: const states = \[ Cart, CartSaved, CartSavedItems \]

would return:

const graph = { cart: \['saved'\], saved: \['items'\], items: \[\] };
*__ignore__*: 

**Parameters:**

| Param | Type |
| ------ | ------ |
| stateClasses | [StateClass](../interfaces/_internals_.stateclass.md)[] | 

**Returns:** [StateKeyGraph](_internals_.md#statekeygraph)

___
<a id="ensureselectormetadata"></a>

###  ensureSelectorMetadata

▸ **ensureSelectorMetadata**(target: *`any`*): [SelectorMetaDataModel](../interfaces/_internals_.selectormetadatamodel.md)

*Defined in [internals.ts:78](https://github.com/amcdnl/ngxs/blob/4ba1032/packages/store/src/internals.ts#L78)*

Ensures metadata is attached to the selector and returns it.
*__ignore__*: 

**Parameters:**

| Param | Type |
| ------ | ------ |
| target | `any` | 

**Returns:** [SelectorMetaDataModel](../interfaces/_internals_.selectormetadatamodel.md)

___
<a id="ensurestoremetadata"></a>

###  ensureStoreMetadata

▸ **ensureStoreMetadata**(target: *`any`*): [MetaDataModel](../interfaces/_internals_.metadatamodel.md)

*Defined in [internals.ts:56](https://github.com/amcdnl/ngxs/blob/4ba1032/packages/store/src/internals.ts#L56)*

Ensures metadata is attached to the class and returns it.
*__ignore__*: 

**Parameters:**

| Param | Type |
| ------ | ------ |
| target | `any` | 

**Returns:** [MetaDataModel](../interfaces/_internals_.metadatamodel.md)

___
<a id="fastpropgetter"></a>

###  fastPropGetter

▸ **fastPropGetter**(paths: *`string`[]*): `function`

*Defined in [internals.ts:99](https://github.com/amcdnl/ngxs/blob/4ba1032/packages/store/src/internals.ts#L99)*

The generated function is faster than:

*   pluck (Observable operator)
*   memoize
*__ignore__*: 

**Parameters:**

| Param | Type |
| ------ | ------ |
| paths | `string`[] | 

**Returns:** `function`

___
<a id="findfullparentpath"></a>

###  findFullParentPath

▸ **findFullParentPath**(obj: *[StateKeyGraph](_internals_.md#statekeygraph)*, newObj?: *[ObjectKeyMap](../interfaces/_internals_.objectkeymap.md)<`string`>*): [ObjectKeyMap](../interfaces/_internals_.objectkeymap.md)<`string`>

*Defined in [internals.ts:200](https://github.com/amcdnl/ngxs/blob/4ba1032/packages/store/src/internals.ts#L200)*

Given a object relationship graph will return the full path for the child items. Example:

const graph = { cart: \['saved'\], saved: \['items'\], items: \[\] };

would return:

const r = { cart: 'cart', saved: 'cart.saved', items: 'cart.saved.items' };
*__ignore__*: 

**Parameters:**

| Param | Type | Default value |
| ------ | ------ | ------ |
| obj | [StateKeyGraph](_internals_.md#statekeygraph) | - | 
| `Default value` newObj | [ObjectKeyMap](../interfaces/_internals_.objectkeymap.md)<`string`> |  {} | 

**Returns:** [ObjectKeyMap](../interfaces/_internals_.objectkeymap.md)<`string`>

___
<a id="isobject"></a>

###  isObject

▸ **isObject**(obj: *`any`*): `boolean`

*Defined in [internals.ts:279](https://github.com/amcdnl/ngxs/blob/4ba1032/packages/store/src/internals.ts#L279)*

Returns if the parameter is a object or not.
*__ignore__*: 

**Parameters:**

| Param | Type |
| ------ | ------ |
| obj | `any` | 

**Returns:** `boolean`

___
<a id="nametostate"></a>

###  nameToState

▸ **nameToState**(states: *[StateClass](../interfaces/_internals_.stateclass.md)[]*): [ObjectKeyMap](../interfaces/_internals_.objectkeymap.md)<[StateClass](../interfaces/_internals_.stateclass.md)>

*Defined in [internals.ts:168](https://github.com/amcdnl/ngxs/blob/4ba1032/packages/store/src/internals.ts#L168)*

Given a states array, returns object graph returning the name and state metadata. Example:

const graph = { cart: { metadata } };
*__ignore__*: 

**Parameters:**

| Param | Type |
| ------ | ------ |
| states | [StateClass](../interfaces/_internals_.stateclass.md)[] | 

**Returns:** [ObjectKeyMap](../interfaces/_internals_.objectkeymap.md)<[StateClass](../interfaces/_internals_.stateclass.md)>

___
<a id="topologicalsort"></a>

###  topologicalSort

▸ **topologicalSort**(graph: *[StateKeyGraph](_internals_.md#statekeygraph)*): `string`[]

*Defined in [internals.ts:240](https://github.com/amcdnl/ngxs/blob/4ba1032/packages/store/src/internals.ts#L240)*

Given a object graph, it will return the items topologically sorted Example:

const graph = { cart: \['saved'\], saved: \['items'\], items: \[\] };

would return:

const results = \[ 'items', 'saved', 'cart' \];
*__ignore__*: 

**Parameters:**

| Param | Type |
| ------ | ------ |
| graph | [StateKeyGraph](_internals_.md#statekeygraph) | 

**Returns:** `string`[]

___


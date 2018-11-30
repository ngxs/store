[API](../README.md) > ["utils/selector-utils"](../modules/_utils_selector_utils_.md)

# External module: "utils/selector-utils"

## Index

### Functions

* [createSelector](_utils_selector_utils_.md#createselector)

---

## Functions

<a id="createselector"></a>

###  createSelector

▸ **createSelector**(selectors: *`any`[]*, originalFn: *`any`*, creationMetadata?: *`object`*): `function`

*Defined in [utils/selector-utils.ts:9](https://github.com/ngxs/store/blob/7d8137d/packages/store/src/utils/selector-utils.ts#L9)*

Function for creating a selector

**Parameters:**

**selectors: `any`[]**

The selectors to use to create the arguments of this function

**originalFn: `any`**

The original function being made into a selector

**`Optional` creationMetadata: `object`**

| Name | Type |
| ------ | ------ |
| containerClass | `any` |
| selectorName | `string` |

**Returns:** `function`

___


[API](../README.md) > ["decorators/state"](../modules/_decorators_state_.md)

# External module: "decorators/state"

## Index

### Variables

* [stateNameRegex](_decorators_state_.md#statenameregex)

### Functions

* [State](_decorators_state_.md#state)

---

## Variables

<a id="statenameregex"></a>

### `<Const>` stateNameRegex

**● stateNameRegex**: *`RegExp`* =  new RegExp('^[a-zA-Z0-9]+$')

*Defined in [decorators/state.ts:4](https://github.com/ngxs/store/blob/7d8137d/packages/store/src/decorators/state.ts#L4)*

___

## Functions

<a id="state"></a>

###  State

▸ **State**<`T`>(options: *[StoreOptions](../interfaces/_symbols_.storeoptions.md)<`T`>*): `(Anonymous function)`

*Defined in [decorators/state.ts:16](https://github.com/ngxs/store/blob/7d8137d/packages/store/src/decorators/state.ts#L16)*

Decorates a class with ngxs state information.

**Type parameters:**

#### T 
**Parameters:**

| Name | Type |
| ------ | ------ |
| options | [StoreOptions](../interfaces/_symbols_.storeoptions.md)<`T`> |

**Returns:** `(Anonymous function)`

___


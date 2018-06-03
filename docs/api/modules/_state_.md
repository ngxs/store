[API](../README.md) > ["state"](../modules/_state_.md)

# External module: "state"

## Index

### Variables

* [stateNameRegex](_state_.md#statenameregex)

### Functions

* [State](_state_.md#state)
* [stateNameErrorMessage](_state_.md#statenameerrormessage)

---

## Variables

<a id="statenameregex"></a>

### `<Const>` stateNameRegex

**● stateNameRegex**: *`RegExp`* =  new RegExp('^[a-zA-Z0-9]+$')

*Defined in [state.ts:4](https://github.com/amcdnl/ngxs/blob/4ba1032/packages/store/src/state.ts#L4)*

___

## Functions

<a id="state"></a>

###  State

▸ **State**T(options: *[StoreOptions](../interfaces/_symbols_.storeoptions.md)<`T`>*): `(Anonymous function)`

*Defined in [state.ts:16](https://github.com/amcdnl/ngxs/blob/4ba1032/packages/store/src/state.ts#L16)*

Decorates a class with ngxs state information.

**Type parameters:**

#### T 
**Parameters:**

| Param | Type |
| ------ | ------ |
| options | [StoreOptions](../interfaces/_symbols_.storeoptions.md)<`T`> | 

**Returns:** `(Anonymous function)`

___
<a id="statenameerrormessage"></a>

### `<Const>` stateNameErrorMessage

▸ **stateNameErrorMessage**(name: *`any`*): `string`

*Defined in [state.ts:10](https://github.com/amcdnl/ngxs/blob/4ba1032/packages/store/src/state.ts#L10)*

Error message

**Parameters:**

| Param | Type |
| ------ | ------ |
| name | `any` | 

**Returns:** `string`

___


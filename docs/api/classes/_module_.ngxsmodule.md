[API](../README.md) > ["module"](../modules/_module_.md) > [NgxsModule](../classes/_module_.ngxsmodule.md)

# Class: NgxsModule

Ngxs Module

## Hierarchy

**NgxsModule**

## Index

### Methods

* [forFeature](_module_.ngxsmodule.md#forfeature)
* [forRoot](_module_.ngxsmodule.md#forroot)

---

## Methods

<a id="forfeature"></a>

### `<Static>` forFeature

▸ **forFeature**(states: *`any`[]*): `ModuleWithProviders`

*Defined in [module.ts:145](https://github.com/amcdnl/ngxs/blob/4ba1032/packages/store/src/module.ts#L145)*

Feature module factory

**Parameters:**

| Param | Type |
| ------ | ------ |
| states | `any`[] | 

**Returns:** `ModuleWithProviders`

___
<a id="forroot"></a>

### `<Static>` forRoot

▸ **forRoot**(states?: *`any`[]*, options?: *[ModuleOptions](../modules/_module_.md#moduleoptions)*): `ModuleWithProviders`

*Defined in [module.ts:109](https://github.com/amcdnl/ngxs/blob/4ba1032/packages/store/src/module.ts#L109)*

Root module factory

**Parameters:**

| Param | Type | Default value |
| ------ | ------ | ------ |
| `Default value` states | `any`[] |  [] | 
| `Default value` options | [ModuleOptions](../modules/_module_.md#moduleoptions) |  {} | 

**Returns:** `ModuleWithProviders`

___


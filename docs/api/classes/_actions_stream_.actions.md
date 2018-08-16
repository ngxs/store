[API](../README.md) > ["actions-stream"](../modules/_actions_stream_.md) > [Actions](../classes/_actions_stream_.actions.md)

# Class: Actions

Action stream that is emitted anytime an action is dispatched.

You can listen to this in services to react without stores.

## Hierarchy

 `Observable`<`any`>

**↳ Actions**

## Implements

* `Subscribable`<`any`>

## Index

### Constructors

* [constructor](_actions_stream_.actions.md#constructor)

### Properties

* [_isScalar](_actions_stream_.actions.md#_isscalar)
* [operator](_actions_stream_.actions.md#operator)
* [source](_actions_stream_.actions.md#source)
* [create](_actions_stream_.actions.md#create)
* [if](_actions_stream_.actions.md#if)
* [throw](_actions_stream_.actions.md#throw)

### Methods

* [_subscribe](_actions_stream_.actions.md#_subscribe)
* [_trySubscribe](_actions_stream_.actions.md#_trysubscribe)
* [forEach](_actions_stream_.actions.md#foreach)
* [lift](_actions_stream_.actions.md#lift)
* [pipe](_actions_stream_.actions.md#pipe)
* [subscribe](_actions_stream_.actions.md#subscribe)
* [toPromise](_actions_stream_.actions.md#topromise)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new Actions**(actions$: *[InternalActions](_actions_stream_.internalactions.md)*): [Actions](_actions_stream_.actions.md)

*Overrides Observable.__constructor*

*Defined in [actions-stream.ts:66](https://github.com/amcdnl/ngxs/blob/4ba1032/packages/store/src/actions-stream.ts#L66)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| actions$ | [InternalActions](_actions_stream_.internalactions.md) | 

**Returns:** [Actions](_actions_stream_.actions.md)

___

## Properties

<a id="_isscalar"></a>

###  _isScalar

**● _isScalar**: *`boolean`*

*Inherited from Observable._isScalar*

*Defined in /Users/austin/dev/ngxs/node_modules/rxjs/internal/Observable.d.ts:16*

Internal implementation detail, do not use directly.

___
<a id="operator"></a>

###  operator

**● operator**: *`Operator`<`any`, `any`>*

*Inherited from Observable.operator*

*Defined in /Users/austin/dev/ngxs/node_modules/rxjs/internal/Observable.d.ts:20*

*__deprecated__*: This is an internal implementation detail, do not use.

___
<a id="source"></a>

###  source

**● source**: *`Observable`<`any`>*

*Inherited from Observable.source*

*Defined in /Users/austin/dev/ngxs/node_modules/rxjs/internal/Observable.d.ts:18*

*__deprecated__*: This is an internal implementation detail, do not use.

___
<a id="create"></a>

### `<Static>` create

**● create**: *`Function`*

*Inherited from Observable.create*

*Defined in /Users/austin/dev/ngxs/node_modules/rxjs/internal/Observable.d.ts:38*

Creates a new cold Observable by calling the Observable constructor
*__static__*: true

*__owner__*: Observable

*__method__*: create

*__param__*: the subscriber function to be passed to the Observable constructor

*__returns__*: a new cold observable

*__nocollapse__*: 

___
<a id="if"></a>

### `<Static>` if

**● if**: *`iif`*

*Inherited from Observable.if*

*Defined in /Users/austin/dev/ngxs/node_modules/rxjs/internal/Observable.d.ts:65*

*__nocollapse__*: 

*__deprecated__*: In favor of iif creation function: import { iif } from 'rxjs';

___
<a id="throw"></a>

### `<Static>` throw

**● throw**: *`throwError`*

*Inherited from Observable.throw*

*Defined in /Users/austin/dev/ngxs/node_modules/rxjs/internal/Observable.d.ts:70*

*__nocollapse__*: 

*__deprecated__*: In favor of throwError creation function: import { throwError } from 'rxjs';

___

## Methods

<a id="_subscribe"></a>

###  _subscribe

▸ **_subscribe**(subscriber: *`Subscriber`<`any`>*): `TeardownLogic`

*Inherited from Observable._subscribe*

*Defined in /Users/austin/dev/ngxs/node_modules/rxjs/internal/Observable.d.ts:60*

*__deprecated__*: This is an internal implementation detail, do not use.

**Parameters:**

| Param | Type |
| ------ | ------ |
| subscriber | `Subscriber`<`any`> | 

**Returns:** `TeardownLogic`

___
<a id="_trysubscribe"></a>

###  _trySubscribe

▸ **_trySubscribe**(sink: *`Subscriber`<`any`>*): `TeardownLogic`

*Inherited from Observable._trySubscribe*

*Defined in /Users/austin/dev/ngxs/node_modules/rxjs/internal/Observable.d.ts:50*

*__deprecated__*: This is an internal implementation detail, do not use.

**Parameters:**

| Param | Type |
| ------ | ------ |
| sink | `Subscriber`<`any`> | 

**Returns:** `TeardownLogic`

___
<a id="foreach"></a>

###  forEach

▸ **forEach**(next: *`function`*, promiseCtor?: *`PromiseConstructorLike`*): `Promise`<`void`>

*Inherited from Observable.forEach*

*Defined in /Users/austin/dev/ngxs/node_modules/rxjs/internal/Observable.d.ts:58*

*__method__*: forEach

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| next | `function` |  a handler for each value emitted by the observable |
| `Optional` promiseCtor | `PromiseConstructorLike` | 

**Returns:** `Promise`<`void`>
a promise that either resolves on observable completion or
 rejects with the handled error

___
<a id="lift"></a>

###  lift

▸ **lift**R(operator: *`Operator`<`any`, `R`>*): `Observable`<`R`>

*Inherited from Observable.lift*

*Defined in /Users/austin/dev/ngxs/node_modules/rxjs/internal/Observable.d.ts:46*

Creates a new Observable, with this Observable as the source, and the passed operator defined as the new observable's operator.
*__method__*: lift

**Type parameters:**

#### R 
**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| operator | `Operator`<`any`, `R`> |  the operator defining the operation to take on the observable |

**Returns:** `Observable`<`R`>
a new observable with the Operator applied

___
<a id="pipe"></a>

###  pipe

▸ **pipe**(): `Observable`<`any`>

▸ **pipe**A(op1: *`OperatorFunction`<`any`, `A`>*): `Observable`<`A`>

▸ **pipe**A,B(op1: *`OperatorFunction`<`any`, `A`>*, op2: *`OperatorFunction`<`A`, `B`>*): `Observable`<`B`>

▸ **pipe**A,B,C(op1: *`OperatorFunction`<`any`, `A`>*, op2: *`OperatorFunction`<`A`, `B`>*, op3: *`OperatorFunction`<`B`, `C`>*): `Observable`<`C`>

▸ **pipe**A,B,C,D(op1: *`OperatorFunction`<`any`, `A`>*, op2: *`OperatorFunction`<`A`, `B`>*, op3: *`OperatorFunction`<`B`, `C`>*, op4: *`OperatorFunction`<`C`, `D`>*): `Observable`<`D`>

▸ **pipe**A,B,C,D,E(op1: *`OperatorFunction`<`any`, `A`>*, op2: *`OperatorFunction`<`A`, `B`>*, op3: *`OperatorFunction`<`B`, `C`>*, op4: *`OperatorFunction`<`C`, `D`>*, op5: *`OperatorFunction`<`D`, `E`>*): `Observable`<`E`>

▸ **pipe**A,B,C,D,E,F(op1: *`OperatorFunction`<`any`, `A`>*, op2: *`OperatorFunction`<`A`, `B`>*, op3: *`OperatorFunction`<`B`, `C`>*, op4: *`OperatorFunction`<`C`, `D`>*, op5: *`OperatorFunction`<`D`, `E`>*, op6: *`OperatorFunction`<`E`, `F`>*): `Observable`<`F`>

▸ **pipe**A,B,C,D,E,F,G(op1: *`OperatorFunction`<`any`, `A`>*, op2: *`OperatorFunction`<`A`, `B`>*, op3: *`OperatorFunction`<`B`, `C`>*, op4: *`OperatorFunction`<`C`, `D`>*, op5: *`OperatorFunction`<`D`, `E`>*, op6: *`OperatorFunction`<`E`, `F`>*, op7: *`OperatorFunction`<`F`, `G`>*): `Observable`<`G`>

▸ **pipe**A,B,C,D,E,F,G,H(op1: *`OperatorFunction`<`any`, `A`>*, op2: *`OperatorFunction`<`A`, `B`>*, op3: *`OperatorFunction`<`B`, `C`>*, op4: *`OperatorFunction`<`C`, `D`>*, op5: *`OperatorFunction`<`D`, `E`>*, op6: *`OperatorFunction`<`E`, `F`>*, op7: *`OperatorFunction`<`F`, `G`>*, op8: *`OperatorFunction`<`G`, `H`>*): `Observable`<`H`>

▸ **pipe**A,B,C,D,E,F,G,H,I(op1: *`OperatorFunction`<`any`, `A`>*, op2: *`OperatorFunction`<`A`, `B`>*, op3: *`OperatorFunction`<`B`, `C`>*, op4: *`OperatorFunction`<`C`, `D`>*, op5: *`OperatorFunction`<`D`, `E`>*, op6: *`OperatorFunction`<`E`, `F`>*, op7: *`OperatorFunction`<`F`, `G`>*, op8: *`OperatorFunction`<`G`, `H`>*, op9: *`OperatorFunction`<`H`, `I`>*): `Observable`<`I`>

▸ **pipe**R(...operations: *`OperatorFunction`<`any`, `R`>[]*): `Observable`<`R`>

*Inherited from Observable.pipe*

*Defined in /Users/austin/dev/ngxs/node_modules/rxjs/internal/Observable.d.ts:71*

**Returns:** `Observable`<`any`>

*Inherited from Observable.pipe*

*Defined in /Users/austin/dev/ngxs/node_modules/rxjs/internal/Observable.d.ts:72*

**Type parameters:**

#### A 
**Parameters:**

| Param | Type |
| ------ | ------ |
| op1 | `OperatorFunction`<`any`, `A`> | 

**Returns:** `Observable`<`A`>

*Inherited from Observable.pipe*

*Defined in /Users/austin/dev/ngxs/node_modules/rxjs/internal/Observable.d.ts:73*

**Type parameters:**

#### A 
#### B 
**Parameters:**

| Param | Type |
| ------ | ------ |
| op1 | `OperatorFunction`<`any`, `A`> | 
| op2 | `OperatorFunction`<`A`, `B`> | 

**Returns:** `Observable`<`B`>

*Inherited from Observable.pipe*

*Defined in /Users/austin/dev/ngxs/node_modules/rxjs/internal/Observable.d.ts:74*

**Type parameters:**

#### A 
#### B 
#### C 
**Parameters:**

| Param | Type |
| ------ | ------ |
| op1 | `OperatorFunction`<`any`, `A`> | 
| op2 | `OperatorFunction`<`A`, `B`> | 
| op3 | `OperatorFunction`<`B`, `C`> | 

**Returns:** `Observable`<`C`>

*Inherited from Observable.pipe*

*Defined in /Users/austin/dev/ngxs/node_modules/rxjs/internal/Observable.d.ts:75*

**Type parameters:**

#### A 
#### B 
#### C 
#### D 
**Parameters:**

| Param | Type |
| ------ | ------ |
| op1 | `OperatorFunction`<`any`, `A`> | 
| op2 | `OperatorFunction`<`A`, `B`> | 
| op3 | `OperatorFunction`<`B`, `C`> | 
| op4 | `OperatorFunction`<`C`, `D`> | 

**Returns:** `Observable`<`D`>

*Inherited from Observable.pipe*

*Defined in /Users/austin/dev/ngxs/node_modules/rxjs/internal/Observable.d.ts:76*

**Type parameters:**

#### A 
#### B 
#### C 
#### D 
#### E 
**Parameters:**

| Param | Type |
| ------ | ------ |
| op1 | `OperatorFunction`<`any`, `A`> | 
| op2 | `OperatorFunction`<`A`, `B`> | 
| op3 | `OperatorFunction`<`B`, `C`> | 
| op4 | `OperatorFunction`<`C`, `D`> | 
| op5 | `OperatorFunction`<`D`, `E`> | 

**Returns:** `Observable`<`E`>

*Inherited from Observable.pipe*

*Defined in /Users/austin/dev/ngxs/node_modules/rxjs/internal/Observable.d.ts:77*

**Type parameters:**

#### A 
#### B 
#### C 
#### D 
#### E 
#### F 
**Parameters:**

| Param | Type |
| ------ | ------ |
| op1 | `OperatorFunction`<`any`, `A`> | 
| op2 | `OperatorFunction`<`A`, `B`> | 
| op3 | `OperatorFunction`<`B`, `C`> | 
| op4 | `OperatorFunction`<`C`, `D`> | 
| op5 | `OperatorFunction`<`D`, `E`> | 
| op6 | `OperatorFunction`<`E`, `F`> | 

**Returns:** `Observable`<`F`>

*Inherited from Observable.pipe*

*Defined in /Users/austin/dev/ngxs/node_modules/rxjs/internal/Observable.d.ts:78*

**Type parameters:**

#### A 
#### B 
#### C 
#### D 
#### E 
#### F 
#### G 
**Parameters:**

| Param | Type |
| ------ | ------ |
| op1 | `OperatorFunction`<`any`, `A`> | 
| op2 | `OperatorFunction`<`A`, `B`> | 
| op3 | `OperatorFunction`<`B`, `C`> | 
| op4 | `OperatorFunction`<`C`, `D`> | 
| op5 | `OperatorFunction`<`D`, `E`> | 
| op6 | `OperatorFunction`<`E`, `F`> | 
| op7 | `OperatorFunction`<`F`, `G`> | 

**Returns:** `Observable`<`G`>

*Inherited from Observable.pipe*

*Defined in /Users/austin/dev/ngxs/node_modules/rxjs/internal/Observable.d.ts:79*

**Type parameters:**

#### A 
#### B 
#### C 
#### D 
#### E 
#### F 
#### G 
#### H 
**Parameters:**

| Param | Type |
| ------ | ------ |
| op1 | `OperatorFunction`<`any`, `A`> | 
| op2 | `OperatorFunction`<`A`, `B`> | 
| op3 | `OperatorFunction`<`B`, `C`> | 
| op4 | `OperatorFunction`<`C`, `D`> | 
| op5 | `OperatorFunction`<`D`, `E`> | 
| op6 | `OperatorFunction`<`E`, `F`> | 
| op7 | `OperatorFunction`<`F`, `G`> | 
| op8 | `OperatorFunction`<`G`, `H`> | 

**Returns:** `Observable`<`H`>

*Inherited from Observable.pipe*

*Defined in /Users/austin/dev/ngxs/node_modules/rxjs/internal/Observable.d.ts:80*

**Type parameters:**

#### A 
#### B 
#### C 
#### D 
#### E 
#### F 
#### G 
#### H 
#### I 
**Parameters:**

| Param | Type |
| ------ | ------ |
| op1 | `OperatorFunction`<`any`, `A`> | 
| op2 | `OperatorFunction`<`A`, `B`> | 
| op3 | `OperatorFunction`<`B`, `C`> | 
| op4 | `OperatorFunction`<`C`, `D`> | 
| op5 | `OperatorFunction`<`D`, `E`> | 
| op6 | `OperatorFunction`<`E`, `F`> | 
| op7 | `OperatorFunction`<`F`, `G`> | 
| op8 | `OperatorFunction`<`G`, `H`> | 
| op9 | `OperatorFunction`<`H`, `I`> | 

**Returns:** `Observable`<`I`>

*Inherited from Observable.pipe*

*Defined in /Users/austin/dev/ngxs/node_modules/rxjs/internal/Observable.d.ts:81*

**Type parameters:**

#### R 
**Parameters:**

| Param | Type |
| ------ | ------ |
| `Rest` operations | `OperatorFunction`<`any`, `R`>[] | 

**Returns:** `Observable`<`R`>

___
<a id="subscribe"></a>

###  subscribe

▸ **subscribe**(observer?: *`PartialObserver`<`any`>*): `Subscription`

▸ **subscribe**(next?: *`function`*, error?: *`function`*, complete?: *`function`*): `Subscription`

*Inherited from Observable.subscribe*

*Defined in /Users/austin/dev/ngxs/node_modules/rxjs/internal/Observable.d.ts:47*

**Parameters:**

| Param | Type |
| ------ | ------ |
| `Optional` observer | `PartialObserver`<`any`> | 

**Returns:** `Subscription`

*Inherited from Observable.subscribe*

*Defined in /Users/austin/dev/ngxs/node_modules/rxjs/internal/Observable.d.ts:48*

**Parameters:**

| Param | Type |
| ------ | ------ |
| `Optional` next | `function` | 
| `Optional` error | `function` | 
| `Optional` complete | `function` | 

**Returns:** `Subscription`

___
<a id="topromise"></a>

###  toPromise

▸ **toPromise**T(this: *`Observable`<`T`>*): `Promise`<`T`>

▸ **toPromise**T(this: *`Observable`<`T`>*, PromiseCtor: *`PromiseConstructor`*): `Promise`<`T`>

▸ **toPromise**T(this: *`Observable`<`T`>*, PromiseCtor: *`PromiseConstructorLike`*): `Promise`<`T`>

*Inherited from Observable.toPromise*

*Defined in /Users/austin/dev/ngxs/node_modules/rxjs/internal/Observable.d.ts:82*

**Type parameters:**

#### T 
**Parameters:**

| Param | Type |
| ------ | ------ |
| this | `Observable`<`T`> | 

**Returns:** `Promise`<`T`>

*Inherited from Observable.toPromise*

*Defined in /Users/austin/dev/ngxs/node_modules/rxjs/internal/Observable.d.ts:83*

**Type parameters:**

#### T 
**Parameters:**

| Param | Type |
| ------ | ------ |
| this | `Observable`<`T`> | 
| PromiseCtor | `PromiseConstructor` | 

**Returns:** `Promise`<`T`>

*Inherited from Observable.toPromise*

*Defined in /Users/austin/dev/ngxs/node_modules/rxjs/internal/Observable.d.ts:84*

**Type parameters:**

#### T 
**Parameters:**

| Param | Type |
| ------ | ------ |
| this | `Observable`<`T`> | 
| PromiseCtor | `PromiseConstructorLike` | 

**Returns:** `Promise`<`T`>

___


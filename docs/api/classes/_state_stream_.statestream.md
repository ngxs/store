[API](../README.md) > ["state-stream"](../modules/_state_stream_.md) > [StateStream](../classes/_state_stream_.statestream.md)

# Class: StateStream

BehaviorSubject of the entire state.
*__ignore__*: 

## Hierarchy

 `BehaviorSubject`<`any`>

**↳ StateStream**

## Implements

* `Subscribable`<`any`>
* `SubscriptionLike`

## Index

### Constructors

* [constructor](_state_stream_.statestream.md#constructor)

### Properties

* [_isScalar](_state_stream_.statestream.md#_isscalar)
* [closed](_state_stream_.statestream.md#closed)
* [hasError](_state_stream_.statestream.md#haserror)
* [isStopped](_state_stream_.statestream.md#isstopped)
* [observers](_state_stream_.statestream.md#observers)
* [operator](_state_stream_.statestream.md#operator)
* [source](_state_stream_.statestream.md#source)
* [thrownError](_state_stream_.statestream.md#thrownerror)
* [value](_state_stream_.statestream.md#value)
* [create](_state_stream_.statestream.md#create)
* [if](_state_stream_.statestream.md#if)
* [throw](_state_stream_.statestream.md#throw)

### Methods

* [_subscribe](_state_stream_.statestream.md#_subscribe)
* [_trySubscribe](_state_stream_.statestream.md#_trysubscribe)
* [asObservable](_state_stream_.statestream.md#asobservable)
* [complete](_state_stream_.statestream.md#complete)
* [error](_state_stream_.statestream.md#error)
* [forEach](_state_stream_.statestream.md#foreach)
* [getValue](_state_stream_.statestream.md#getvalue)
* [lift](_state_stream_.statestream.md#lift)
* [next](_state_stream_.statestream.md#next)
* [pipe](_state_stream_.statestream.md#pipe)
* [subscribe](_state_stream_.statestream.md#subscribe)
* [toPromise](_state_stream_.statestream.md#topromise)
* [unsubscribe](_state_stream_.statestream.md#unsubscribe)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new StateStream**(): [StateStream](_state_stream_.statestream.md)

*Overrides BehaviorSubject.__constructor*

*Defined in [state-stream.ts:9](https://github.com/amcdnl/ngxs/blob/4ba1032/packages/store/src/state-stream.ts#L9)*

**Returns:** [StateStream](_state_stream_.statestream.md)

___

## Properties

<a id="_isscalar"></a>

###  _isScalar

**● _isScalar**: *`boolean`*

*Inherited from Observable._isScalar*

*Defined in /Users/austin/dev/ngxs/node_modules/rxjs/internal/Observable.d.ts:16*

Internal implementation detail, do not use directly.

___
<a id="closed"></a>

###  closed

**● closed**: *`boolean`*

*Inherited from Subject.closed*

*Defined in /Users/austin/dev/ngxs/node_modules/rxjs/internal/Subject.d.ts:18*

___
<a id="haserror"></a>

###  hasError

**● hasError**: *`boolean`*

*Inherited from Subject.hasError*

*Defined in /Users/austin/dev/ngxs/node_modules/rxjs/internal/Subject.d.ts:20*

___
<a id="isstopped"></a>

###  isStopped

**● isStopped**: *`boolean`*

*Inherited from Subject.isStopped*

*Defined in /Users/austin/dev/ngxs/node_modules/rxjs/internal/Subject.d.ts:19*

___
<a id="observers"></a>

###  observers

**● observers**: *`Observer`<`any`>[]*

*Inherited from Subject.observers*

*Defined in /Users/austin/dev/ngxs/node_modules/rxjs/internal/Subject.d.ts:17*

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
<a id="thrownerror"></a>

###  thrownError

**● thrownError**: *`any`*

*Inherited from Subject.thrownError*

*Defined in /Users/austin/dev/ngxs/node_modules/rxjs/internal/Subject.d.ts:21*

___
<a id="value"></a>

###  value

**● value**: *`any`*

*Inherited from BehaviorSubject.value*

*Defined in /Users/austin/dev/ngxs/node_modules/rxjs/internal/BehaviorSubject.d.ts:10*

___
<a id="create"></a>

### `<Static>` create

**● create**: *`Function`*

*Inherited from Subject.create*

*Overrides Observable.create*

*Defined in /Users/austin/dev/ngxs/node_modules/rxjs/internal/Subject.d.ts:24*

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

▸ **_subscribe**(subscriber: *`Subscriber`<`any`>*): `Subscription`

*Inherited from BehaviorSubject._subscribe*

*Overrides Subject._subscribe*

*Defined in /Users/austin/dev/ngxs/node_modules/rxjs/internal/BehaviorSubject.d.ts:12*

*__deprecated__*: This is an internal implementation detail, do not use.

**Parameters:**

| Param | Type |
| ------ | ------ |
| subscriber | `Subscriber`<`any`> | 

**Returns:** `Subscription`

___
<a id="_trysubscribe"></a>

###  _trySubscribe

▸ **_trySubscribe**(subscriber: *`Subscriber`<`any`>*): `TeardownLogic`

*Inherited from Subject._trySubscribe*

*Overrides Observable._trySubscribe*

*Defined in /Users/austin/dev/ngxs/node_modules/rxjs/internal/Subject.d.ts:31*

*__deprecated__*: This is an internal implementation detail, do not use.

**Parameters:**

| Param | Type |
| ------ | ------ |
| subscriber | `Subscriber`<`any`> | 

**Returns:** `TeardownLogic`

___
<a id="asobservable"></a>

###  asObservable

▸ **asObservable**(): `Observable`<`any`>

*Inherited from Subject.asObservable*

*Defined in /Users/austin/dev/ngxs/node_modules/rxjs/internal/Subject.d.ts:34*

**Returns:** `Observable`<`any`>

___
<a id="complete"></a>

###  complete

▸ **complete**(): `void`

*Inherited from Subject.complete*

*Defined in /Users/austin/dev/ngxs/node_modules/rxjs/internal/Subject.d.ts:28*

**Returns:** `void`

___
<a id="error"></a>

###  error

▸ **error**(err: *`any`*): `void`

*Inherited from Subject.error*

*Defined in /Users/austin/dev/ngxs/node_modules/rxjs/internal/Subject.d.ts:27*

**Parameters:**

| Param | Type |
| ------ | ------ |
| err | `any` | 

**Returns:** `void`

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
<a id="getvalue"></a>

###  getValue

▸ **getValue**(): `any`

*Inherited from BehaviorSubject.getValue*

*Defined in /Users/austin/dev/ngxs/node_modules/rxjs/internal/BehaviorSubject.d.ts:13*

**Returns:** `any`

___
<a id="lift"></a>

###  lift

▸ **lift**R(operator: *`Operator`<`any`, `R`>*): `Observable`<`R`>

*Inherited from Subject.lift*

*Overrides Observable.lift*

*Defined in /Users/austin/dev/ngxs/node_modules/rxjs/internal/Subject.d.ts:25*

**Type parameters:**

#### R 
**Parameters:**

| Param | Type |
| ------ | ------ |
| operator | `Operator`<`any`, `R`> | 

**Returns:** `Observable`<`R`>

___
<a id="next"></a>

###  next

▸ **next**(value: *`any`*): `void`

*Inherited from BehaviorSubject.next*

*Overrides Subject.next*

*Defined in /Users/austin/dev/ngxs/node_modules/rxjs/internal/BehaviorSubject.d.ts:14*

**Parameters:**

| Param | Type |
| ------ | ------ |
| value | `any` | 

**Returns:** `void`

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
<a id="unsubscribe"></a>

###  unsubscribe

▸ **unsubscribe**(): `void`

*Inherited from Subject.unsubscribe*

*Defined in /Users/austin/dev/ngxs/node_modules/rxjs/internal/Subject.d.ts:29*

**Returns:** `void`

___


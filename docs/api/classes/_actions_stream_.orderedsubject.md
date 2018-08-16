[API](../README.md) > ["actions-stream"](../modules/_actions_stream_.md) > [OrderedSubject](../classes/_actions_stream_.orderedsubject.md)

# Class: OrderedSubject

Custom Subject that ensures that subscribers are notified of values in the order that they arrived. A standard Subject does not have this guarantee. For example, given the following code:

      const subject = new Subject<string>();
    subject.subscribe(value => {
    if (value === 'start') subject.next('end');
    });
    subject.subscribe(value => { });
    subject.next('start');
    

When `subject` is a standard `Subject<T>` the second subscriber would recieve `end` and then `start`. When `subject` is a `OrderedSubject<T>` the second subscriber would recieve `start` and then `end`.

## Type parameters
#### T 
## Hierarchy

 `Subject`<`T`>

**↳ OrderedSubject**

↳  [InternalActions](_actions_stream_.internalactions.md)

## Implements

* `Subscribable`<`T`>
* `SubscriptionLike`

## Index

### Constructors

* [constructor](_actions_stream_.orderedsubject.md#constructor)

### Properties

* [_isScalar](_actions_stream_.orderedsubject.md#_isscalar)
* [closed](_actions_stream_.orderedsubject.md#closed)
* [hasError](_actions_stream_.orderedsubject.md#haserror)
* [isStopped](_actions_stream_.orderedsubject.md#isstopped)
* [observers](_actions_stream_.orderedsubject.md#observers)
* [operator](_actions_stream_.orderedsubject.md#operator)
* [source](_actions_stream_.orderedsubject.md#source)
* [thrownError](_actions_stream_.orderedsubject.md#thrownerror)
* [create](_actions_stream_.orderedsubject.md#create)
* [if](_actions_stream_.orderedsubject.md#if)
* [throw](_actions_stream_.orderedsubject.md#throw)

### Methods

* [_subscribe](_actions_stream_.orderedsubject.md#_subscribe)
* [_trySubscribe](_actions_stream_.orderedsubject.md#_trysubscribe)
* [asObservable](_actions_stream_.orderedsubject.md#asobservable)
* [complete](_actions_stream_.orderedsubject.md#complete)
* [error](_actions_stream_.orderedsubject.md#error)
* [forEach](_actions_stream_.orderedsubject.md#foreach)
* [lift](_actions_stream_.orderedsubject.md#lift)
* [next](_actions_stream_.orderedsubject.md#next)
* [pipe](_actions_stream_.orderedsubject.md#pipe)
* [subscribe](_actions_stream_.orderedsubject.md#subscribe)
* [toPromise](_actions_stream_.orderedsubject.md#topromise)
* [unsubscribe](_actions_stream_.orderedsubject.md#unsubscribe)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new OrderedSubject**(): [OrderedSubject](_actions_stream_.orderedsubject.md)

*Inherited from Subject.__constructor*

*Overrides Observable.__constructor*

*Defined in /Users/austin/dev/ngxs/node_modules/rxjs/internal/Subject.d.ts:21*

**Returns:** [OrderedSubject](_actions_stream_.orderedsubject.md)

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

**● observers**: *`Observer`<`T`>[]*

*Inherited from Subject.observers*

*Defined in /Users/austin/dev/ngxs/node_modules/rxjs/internal/Subject.d.ts:17*

___
<a id="operator"></a>

###  operator

**● operator**: *`Operator`<`any`, `T`>*

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

▸ **_subscribe**(subscriber: *`Subscriber`<`T`>*): `Subscription`

*Inherited from Subject._subscribe*

*Overrides Observable._subscribe*

*Defined in /Users/austin/dev/ngxs/node_modules/rxjs/internal/Subject.d.ts:33*

*__deprecated__*: This is an internal implementation detail, do not use.

**Parameters:**

| Param | Type |
| ------ | ------ |
| subscriber | `Subscriber`<`T`> | 

**Returns:** `Subscription`

___
<a id="_trysubscribe"></a>

###  _trySubscribe

▸ **_trySubscribe**(subscriber: *`Subscriber`<`T`>*): `TeardownLogic`

*Inherited from Subject._trySubscribe*

*Overrides Observable._trySubscribe*

*Defined in /Users/austin/dev/ngxs/node_modules/rxjs/internal/Subject.d.ts:31*

*__deprecated__*: This is an internal implementation detail, do not use.

**Parameters:**

| Param | Type |
| ------ | ------ |
| subscriber | `Subscriber`<`T`> | 

**Returns:** `TeardownLogic`

___
<a id="asobservable"></a>

###  asObservable

▸ **asObservable**(): `Observable`<`T`>

*Inherited from Subject.asObservable*

*Defined in /Users/austin/dev/ngxs/node_modules/rxjs/internal/Subject.d.ts:34*

**Returns:** `Observable`<`T`>

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
<a id="lift"></a>

###  lift

▸ **lift**R(operator: *`Operator`<`T`, `R`>*): `Observable`<`R`>

*Inherited from Subject.lift*

*Overrides Observable.lift*

*Defined in /Users/austin/dev/ngxs/node_modules/rxjs/internal/Subject.d.ts:25*

**Type parameters:**

#### R 
**Parameters:**

| Param | Type |
| ------ | ------ |
| operator | `Operator`<`T`, `R`> | 

**Returns:** `Observable`<`R`>

___
<a id="next"></a>

###  next

▸ **next**(value?: *`T`*): `void`

*Overrides Subject.next*

*Defined in [actions-stream.ts:39](https://github.com/amcdnl/ngxs/blob/4ba1032/packages/store/src/actions-stream.ts#L39)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| `Optional` value | `T` | 

**Returns:** `void`

___
<a id="pipe"></a>

###  pipe

▸ **pipe**(): `Observable`<`T`>

▸ **pipe**A(op1: *`OperatorFunction`<`T`, `A`>*): `Observable`<`A`>

▸ **pipe**A,B(op1: *`OperatorFunction`<`T`, `A`>*, op2: *`OperatorFunction`<`A`, `B`>*): `Observable`<`B`>

▸ **pipe**A,B,C(op1: *`OperatorFunction`<`T`, `A`>*, op2: *`OperatorFunction`<`A`, `B`>*, op3: *`OperatorFunction`<`B`, `C`>*): `Observable`<`C`>

▸ **pipe**A,B,C,D(op1: *`OperatorFunction`<`T`, `A`>*, op2: *`OperatorFunction`<`A`, `B`>*, op3: *`OperatorFunction`<`B`, `C`>*, op4: *`OperatorFunction`<`C`, `D`>*): `Observable`<`D`>

▸ **pipe**A,B,C,D,E(op1: *`OperatorFunction`<`T`, `A`>*, op2: *`OperatorFunction`<`A`, `B`>*, op3: *`OperatorFunction`<`B`, `C`>*, op4: *`OperatorFunction`<`C`, `D`>*, op5: *`OperatorFunction`<`D`, `E`>*): `Observable`<`E`>

▸ **pipe**A,B,C,D,E,F(op1: *`OperatorFunction`<`T`, `A`>*, op2: *`OperatorFunction`<`A`, `B`>*, op3: *`OperatorFunction`<`B`, `C`>*, op4: *`OperatorFunction`<`C`, `D`>*, op5: *`OperatorFunction`<`D`, `E`>*, op6: *`OperatorFunction`<`E`, `F`>*): `Observable`<`F`>

▸ **pipe**A,B,C,D,E,F,G(op1: *`OperatorFunction`<`T`, `A`>*, op2: *`OperatorFunction`<`A`, `B`>*, op3: *`OperatorFunction`<`B`, `C`>*, op4: *`OperatorFunction`<`C`, `D`>*, op5: *`OperatorFunction`<`D`, `E`>*, op6: *`OperatorFunction`<`E`, `F`>*, op7: *`OperatorFunction`<`F`, `G`>*): `Observable`<`G`>

▸ **pipe**A,B,C,D,E,F,G,H(op1: *`OperatorFunction`<`T`, `A`>*, op2: *`OperatorFunction`<`A`, `B`>*, op3: *`OperatorFunction`<`B`, `C`>*, op4: *`OperatorFunction`<`C`, `D`>*, op5: *`OperatorFunction`<`D`, `E`>*, op6: *`OperatorFunction`<`E`, `F`>*, op7: *`OperatorFunction`<`F`, `G`>*, op8: *`OperatorFunction`<`G`, `H`>*): `Observable`<`H`>

▸ **pipe**A,B,C,D,E,F,G,H,I(op1: *`OperatorFunction`<`T`, `A`>*, op2: *`OperatorFunction`<`A`, `B`>*, op3: *`OperatorFunction`<`B`, `C`>*, op4: *`OperatorFunction`<`C`, `D`>*, op5: *`OperatorFunction`<`D`, `E`>*, op6: *`OperatorFunction`<`E`, `F`>*, op7: *`OperatorFunction`<`F`, `G`>*, op8: *`OperatorFunction`<`G`, `H`>*, op9: *`OperatorFunction`<`H`, `I`>*): `Observable`<`I`>

▸ **pipe**R(...operations: *`OperatorFunction`<`T`, `R`>[]*): `Observable`<`R`>

*Inherited from Observable.pipe*

*Defined in /Users/austin/dev/ngxs/node_modules/rxjs/internal/Observable.d.ts:71*

**Returns:** `Observable`<`T`>

*Inherited from Observable.pipe*

*Defined in /Users/austin/dev/ngxs/node_modules/rxjs/internal/Observable.d.ts:72*

**Type parameters:**

#### A 
**Parameters:**

| Param | Type |
| ------ | ------ |
| op1 | `OperatorFunction`<`T`, `A`> | 

**Returns:** `Observable`<`A`>

*Inherited from Observable.pipe*

*Defined in /Users/austin/dev/ngxs/node_modules/rxjs/internal/Observable.d.ts:73*

**Type parameters:**

#### A 
#### B 
**Parameters:**

| Param | Type |
| ------ | ------ |
| op1 | `OperatorFunction`<`T`, `A`> | 
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
| op1 | `OperatorFunction`<`T`, `A`> | 
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
| op1 | `OperatorFunction`<`T`, `A`> | 
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
| op1 | `OperatorFunction`<`T`, `A`> | 
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
| op1 | `OperatorFunction`<`T`, `A`> | 
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
| op1 | `OperatorFunction`<`T`, `A`> | 
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
| op1 | `OperatorFunction`<`T`, `A`> | 
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
| op1 | `OperatorFunction`<`T`, `A`> | 
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
| `Rest` operations | `OperatorFunction`<`T`, `R`>[] | 

**Returns:** `Observable`<`R`>

___
<a id="subscribe"></a>

###  subscribe

▸ **subscribe**(observer?: *`PartialObserver`<`T`>*): `Subscription`

▸ **subscribe**(next?: *`function`*, error?: *`function`*, complete?: *`function`*): `Subscription`

*Inherited from Observable.subscribe*

*Defined in /Users/austin/dev/ngxs/node_modules/rxjs/internal/Observable.d.ts:47*

**Parameters:**

| Param | Type |
| ------ | ------ |
| `Optional` observer | `PartialObserver`<`T`> | 

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


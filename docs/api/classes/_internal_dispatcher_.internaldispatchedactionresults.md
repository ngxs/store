[API](../README.md) > ["internal/dispatcher"](../modules/_internal_dispatcher_.md) > [InternalDispatchedActionResults](../classes/_internal_dispatcher_.internaldispatchedactionresults.md)

# Class: InternalDispatchedActionResults

Internal Action result stream that is emitted when an action is completed. This is used as a method of returning the action result to the dispatcher for the observable returned by the dispatch(...) call. The dispatcher then asynchronously pushes the result from this stream onto the main action stream as a result.

## Hierarchy

 `Subject`<[ActionContext](../interfaces/_actions_stream_.actioncontext.md)>

**↳ InternalDispatchedActionResults**

## Implements

* `Subscribable`<[ActionContext](../interfaces/_actions_stream_.actioncontext.md)>
* `SubscriptionLike`

## Index

### Constructors

* [constructor](_internal_dispatcher_.internaldispatchedactionresults.md#constructor)

### Properties

* [_isScalar](_internal_dispatcher_.internaldispatchedactionresults.md#_isscalar)
* [closed](_internal_dispatcher_.internaldispatchedactionresults.md#closed)
* [hasError](_internal_dispatcher_.internaldispatchedactionresults.md#haserror)
* [isStopped](_internal_dispatcher_.internaldispatchedactionresults.md#isstopped)
* [observers](_internal_dispatcher_.internaldispatchedactionresults.md#observers)
* [operator](_internal_dispatcher_.internaldispatchedactionresults.md#operator)
* [source](_internal_dispatcher_.internaldispatchedactionresults.md#source)
* [thrownError](_internal_dispatcher_.internaldispatchedactionresults.md#thrownerror)
* [create](_internal_dispatcher_.internaldispatchedactionresults.md#create)
* [if](_internal_dispatcher_.internaldispatchedactionresults.md#if)
* [throw](_internal_dispatcher_.internaldispatchedactionresults.md#throw)

### Methods

* [_subscribe](_internal_dispatcher_.internaldispatchedactionresults.md#_subscribe)
* [_trySubscribe](_internal_dispatcher_.internaldispatchedactionresults.md#_trysubscribe)
* [asObservable](_internal_dispatcher_.internaldispatchedactionresults.md#asobservable)
* [complete](_internal_dispatcher_.internaldispatchedactionresults.md#complete)
* [error](_internal_dispatcher_.internaldispatchedactionresults.md#error)
* [forEach](_internal_dispatcher_.internaldispatchedactionresults.md#foreach)
* [lift](_internal_dispatcher_.internaldispatchedactionresults.md#lift)
* [next](_internal_dispatcher_.internaldispatchedactionresults.md#next)
* [pipe](_internal_dispatcher_.internaldispatchedactionresults.md#pipe)
* [subscribe](_internal_dispatcher_.internaldispatchedactionresults.md#subscribe)
* [toPromise](_internal_dispatcher_.internaldispatchedactionresults.md#topromise)
* [unsubscribe](_internal_dispatcher_.internaldispatchedactionresults.md#unsubscribe)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new InternalDispatchedActionResults**(): [InternalDispatchedActionResults](_internal_dispatcher_.internaldispatchedactionresults.md)

*Inherited from Subject.__constructor*

*Overrides Observable.__constructor*

*Defined in C:/Code/OpenSource/ngxs/node_modules/rxjs/internal/Subject.d.ts:27*

**Returns:** [InternalDispatchedActionResults](_internal_dispatcher_.internaldispatchedactionresults.md)

___

## Properties

<a id="_isscalar"></a>

###  _isScalar

**● _isScalar**: *`boolean`*

*Inherited from Observable._isScalar*

*Defined in C:/Code/OpenSource/ngxs/node_modules/rxjs/internal/Observable.d.ts:15*

Internal implementation detail, do not use directly.

___
<a id="closed"></a>

###  closed

**● closed**: *`boolean`*

*Inherited from Subject.closed*

*Defined in C:/Code/OpenSource/ngxs/node_modules/rxjs/internal/Subject.d.ts:24*

___
<a id="haserror"></a>

###  hasError

**● hasError**: *`boolean`*

*Inherited from Subject.hasError*

*Defined in C:/Code/OpenSource/ngxs/node_modules/rxjs/internal/Subject.d.ts:26*

___
<a id="isstopped"></a>

###  isStopped

**● isStopped**: *`boolean`*

*Inherited from Subject.isStopped*

*Defined in C:/Code/OpenSource/ngxs/node_modules/rxjs/internal/Subject.d.ts:25*

___
<a id="observers"></a>

###  observers

**● observers**: *`Observer`<[ActionContext](../interfaces/_actions_stream_.actioncontext.md)>[]*

*Inherited from Subject.observers*

*Defined in C:/Code/OpenSource/ngxs/node_modules/rxjs/internal/Subject.d.ts:23*

___
<a id="operator"></a>

###  operator

**● operator**: *`Operator`<`any`, [ActionContext](../interfaces/_actions_stream_.actioncontext.md)>*

*Inherited from Observable.operator*

*Defined in C:/Code/OpenSource/ngxs/node_modules/rxjs/internal/Observable.d.ts:19*

*__deprecated__*: This is an internal implementation detail, do not use.

___
<a id="source"></a>

###  source

**● source**: *`Observable`<`any`>*

*Inherited from Observable.source*

*Defined in C:/Code/OpenSource/ngxs/node_modules/rxjs/internal/Observable.d.ts:17*

*__deprecated__*: This is an internal implementation detail, do not use.

___
<a id="thrownerror"></a>

###  thrownError

**● thrownError**: *`any`*

*Inherited from Subject.thrownError*

*Defined in C:/Code/OpenSource/ngxs/node_modules/rxjs/internal/Subject.d.ts:27*

___
<a id="create"></a>

### `<Static>` create

**● create**: *`Function`*

*Inherited from Subject.create*

*Overrides Observable.create*

*Defined in C:/Code/OpenSource/ngxs/node_modules/rxjs/internal/Subject.d.ts:30*

*__nocollapse__*: 

___
<a id="if"></a>

### `<Static>` if

**● if**: *`iif`*

*Inherited from Observable.if*

*Defined in C:/Code/OpenSource/ngxs/node_modules/rxjs/internal/Observable.d.ts:64*

*__nocollapse__*: 

*__deprecated__*: In favor of iif creation function: import { iif } from 'rxjs';

___
<a id="throw"></a>

### `<Static>` throw

**● throw**: *`throwError`*

*Inherited from Observable.throw*

*Defined in C:/Code/OpenSource/ngxs/node_modules/rxjs/internal/Observable.d.ts:69*

*__nocollapse__*: 

*__deprecated__*: In favor of throwError creation function: import { throwError } from 'rxjs';

___

## Methods

<a id="_subscribe"></a>

###  _subscribe

▸ **_subscribe**(subscriber: *`Subscriber`<[ActionContext](../interfaces/_actions_stream_.actioncontext.md)>*): `Subscription`

*Inherited from Subject._subscribe*

*Overrides Observable._subscribe*

*Defined in C:/Code/OpenSource/ngxs/node_modules/rxjs/internal/Subject.d.ts:39*

*__deprecated__*: This is an internal implementation detail, do not use.

**Parameters:**

| Name | Type |
| ------ | ------ |
| subscriber | `Subscriber`<[ActionContext](../interfaces/_actions_stream_.actioncontext.md)> |

**Returns:** `Subscription`

___
<a id="_trysubscribe"></a>

###  _trySubscribe

▸ **_trySubscribe**(subscriber: *`Subscriber`<[ActionContext](../interfaces/_actions_stream_.actioncontext.md)>*): `TeardownLogic`

*Inherited from Subject._trySubscribe*

*Overrides Observable._trySubscribe*

*Defined in C:/Code/OpenSource/ngxs/node_modules/rxjs/internal/Subject.d.ts:37*

*__deprecated__*: This is an internal implementation detail, do not use.

**Parameters:**

| Name | Type |
| ------ | ------ |
| subscriber | `Subscriber`<[ActionContext](../interfaces/_actions_stream_.actioncontext.md)> |

**Returns:** `TeardownLogic`

___
<a id="asobservable"></a>

###  asObservable

▸ **asObservable**(): `Observable`<[ActionContext](../interfaces/_actions_stream_.actioncontext.md)>

*Inherited from Subject.asObservable*

*Defined in C:/Code/OpenSource/ngxs/node_modules/rxjs/internal/Subject.d.ts:46*

Creates a new Observable with this Subject as the source. You can do this to create customize Observer-side logic of the Subject and conceal it from code that uses the Observable.

**Returns:** `Observable`<[ActionContext](../interfaces/_actions_stream_.actioncontext.md)>
Observable that the Subject casts to

___
<a id="complete"></a>

###  complete

▸ **complete**(): `void`

*Inherited from Subject.complete*

*Defined in C:/Code/OpenSource/ngxs/node_modules/rxjs/internal/Subject.d.ts:34*

**Returns:** `void`

___
<a id="error"></a>

###  error

▸ **error**(err: *`any`*): `void`

*Inherited from Subject.error*

*Defined in C:/Code/OpenSource/ngxs/node_modules/rxjs/internal/Subject.d.ts:33*

**Parameters:**

| Name | Type |
| ------ | ------ |
| err | `any` |

**Returns:** `void`

___
<a id="foreach"></a>

###  forEach

▸ **forEach**(next: *`function`*, promiseCtor?: *`PromiseConstructorLike`*): `Promise`<`void`>

*Inherited from Observable.forEach*

*Defined in C:/Code/OpenSource/ngxs/node_modules/rxjs/internal/Observable.d.ts:57*

*__method__*: forEach

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| next | `function` |  a handler for each value emitted by the observable |
| `Optional` promiseCtor | `PromiseConstructorLike` |

**Returns:** `Promise`<`void`>
a promise that either resolves on observable completion or
 rejects with the handled error

___
<a id="lift"></a>

###  lift

▸ **lift**<`R`>(operator: *`Operator`<[ActionContext](../interfaces/_actions_stream_.actioncontext.md), `R`>*): `Observable`<`R`>

*Inherited from Subject.lift*

*Overrides Observable.lift*

*Defined in C:/Code/OpenSource/ngxs/node_modules/rxjs/internal/Subject.d.ts:31*

**Type parameters:**

#### R 
**Parameters:**

| Name | Type |
| ------ | ------ |
| operator | `Operator`<[ActionContext](../interfaces/_actions_stream_.actioncontext.md), `R`> |

**Returns:** `Observable`<`R`>

___
<a id="next"></a>

###  next

▸ **next**(value?: *[ActionContext](../interfaces/_actions_stream_.actioncontext.md)*): `void`

*Inherited from Subject.next*

*Defined in C:/Code/OpenSource/ngxs/node_modules/rxjs/internal/Subject.d.ts:32*

**Parameters:**

| Name | Type |
| ------ | ------ |
| `Optional` value | [ActionContext](../interfaces/_actions_stream_.actioncontext.md) |

**Returns:** `void`

___
<a id="pipe"></a>

###  pipe

▸ **pipe**(): `Observable`<[ActionContext](../interfaces/_actions_stream_.actioncontext.md)>

▸ **pipe**<`A`>(op1: *`OperatorFunction`<[ActionContext](../interfaces/_actions_stream_.actioncontext.md), `A`>*): `Observable`<`A`>

▸ **pipe**<`A`,`B`>(op1: *`OperatorFunction`<[ActionContext](../interfaces/_actions_stream_.actioncontext.md), `A`>*, op2: *`OperatorFunction`<`A`, `B`>*): `Observable`<`B`>

▸ **pipe**<`A`,`B`,`C`>(op1: *`OperatorFunction`<[ActionContext](../interfaces/_actions_stream_.actioncontext.md), `A`>*, op2: *`OperatorFunction`<`A`, `B`>*, op3: *`OperatorFunction`<`B`, `C`>*): `Observable`<`C`>

▸ **pipe**<`A`,`B`,`C`,`D`>(op1: *`OperatorFunction`<[ActionContext](../interfaces/_actions_stream_.actioncontext.md), `A`>*, op2: *`OperatorFunction`<`A`, `B`>*, op3: *`OperatorFunction`<`B`, `C`>*, op4: *`OperatorFunction`<`C`, `D`>*): `Observable`<`D`>

▸ **pipe**<`A`,`B`,`C`,`D`,`E`>(op1: *`OperatorFunction`<[ActionContext](../interfaces/_actions_stream_.actioncontext.md), `A`>*, op2: *`OperatorFunction`<`A`, `B`>*, op3: *`OperatorFunction`<`B`, `C`>*, op4: *`OperatorFunction`<`C`, `D`>*, op5: *`OperatorFunction`<`D`, `E`>*): `Observable`<`E`>

▸ **pipe**<`A`,`B`,`C`,`D`,`E`,`F`>(op1: *`OperatorFunction`<[ActionContext](../interfaces/_actions_stream_.actioncontext.md), `A`>*, op2: *`OperatorFunction`<`A`, `B`>*, op3: *`OperatorFunction`<`B`, `C`>*, op4: *`OperatorFunction`<`C`, `D`>*, op5: *`OperatorFunction`<`D`, `E`>*, op6: *`OperatorFunction`<`E`, `F`>*): `Observable`<`F`>

▸ **pipe**<`A`,`B`,`C`,`D`,`E`,`F`,`G`>(op1: *`OperatorFunction`<[ActionContext](../interfaces/_actions_stream_.actioncontext.md), `A`>*, op2: *`OperatorFunction`<`A`, `B`>*, op3: *`OperatorFunction`<`B`, `C`>*, op4: *`OperatorFunction`<`C`, `D`>*, op5: *`OperatorFunction`<`D`, `E`>*, op6: *`OperatorFunction`<`E`, `F`>*, op7: *`OperatorFunction`<`F`, `G`>*): `Observable`<`G`>

▸ **pipe**<`A`,`B`,`C`,`D`,`E`,`F`,`G`,`H`>(op1: *`OperatorFunction`<[ActionContext](../interfaces/_actions_stream_.actioncontext.md), `A`>*, op2: *`OperatorFunction`<`A`, `B`>*, op3: *`OperatorFunction`<`B`, `C`>*, op4: *`OperatorFunction`<`C`, `D`>*, op5: *`OperatorFunction`<`D`, `E`>*, op6: *`OperatorFunction`<`E`, `F`>*, op7: *`OperatorFunction`<`F`, `G`>*, op8: *`OperatorFunction`<`G`, `H`>*): `Observable`<`H`>

▸ **pipe**<`A`,`B`,`C`,`D`,`E`,`F`,`G`,`H`,`I`>(op1: *`OperatorFunction`<[ActionContext](../interfaces/_actions_stream_.actioncontext.md), `A`>*, op2: *`OperatorFunction`<`A`, `B`>*, op3: *`OperatorFunction`<`B`, `C`>*, op4: *`OperatorFunction`<`C`, `D`>*, op5: *`OperatorFunction`<`D`, `E`>*, op6: *`OperatorFunction`<`E`, `F`>*, op7: *`OperatorFunction`<`F`, `G`>*, op8: *`OperatorFunction`<`G`, `H`>*, op9: *`OperatorFunction`<`H`, `I`>*): `Observable`<`I`>

▸ **pipe**<`A`,`B`,`C`,`D`,`E`,`F`,`G`,`H`,`I`>(op1: *`OperatorFunction`<[ActionContext](../interfaces/_actions_stream_.actioncontext.md), `A`>*, op2: *`OperatorFunction`<`A`, `B`>*, op3: *`OperatorFunction`<`B`, `C`>*, op4: *`OperatorFunction`<`C`, `D`>*, op5: *`OperatorFunction`<`D`, `E`>*, op6: *`OperatorFunction`<`E`, `F`>*, op7: *`OperatorFunction`<`F`, `G`>*, op8: *`OperatorFunction`<`G`, `H`>*, op9: *`OperatorFunction`<`H`, `I`>*, ...operations: *`OperatorFunction`<`any`, `any`>[]*): `Observable`<`__type`>

*Inherited from Observable.pipe*

*Defined in C:/Code/OpenSource/ngxs/node_modules/rxjs/internal/Observable.d.ts:70*

**Returns:** `Observable`<[ActionContext](../interfaces/_actions_stream_.actioncontext.md)>

*Inherited from Observable.pipe*

*Defined in C:/Code/OpenSource/ngxs/node_modules/rxjs/internal/Observable.d.ts:71*

**Type parameters:**

#### A 
**Parameters:**

| Name | Type |
| ------ | ------ |
| op1 | `OperatorFunction`<[ActionContext](../interfaces/_actions_stream_.actioncontext.md), `A`> |

**Returns:** `Observable`<`A`>

*Inherited from Observable.pipe*

*Defined in C:/Code/OpenSource/ngxs/node_modules/rxjs/internal/Observable.d.ts:72*

**Type parameters:**

#### A 
#### B 
**Parameters:**

| Name | Type |
| ------ | ------ |
| op1 | `OperatorFunction`<[ActionContext](../interfaces/_actions_stream_.actioncontext.md), `A`> |
| op2 | `OperatorFunction`<`A`, `B`> |

**Returns:** `Observable`<`B`>

*Inherited from Observable.pipe*

*Defined in C:/Code/OpenSource/ngxs/node_modules/rxjs/internal/Observable.d.ts:73*

**Type parameters:**

#### A 
#### B 
#### C 
**Parameters:**

| Name | Type |
| ------ | ------ |
| op1 | `OperatorFunction`<[ActionContext](../interfaces/_actions_stream_.actioncontext.md), `A`> |
| op2 | `OperatorFunction`<`A`, `B`> |
| op3 | `OperatorFunction`<`B`, `C`> |

**Returns:** `Observable`<`C`>

*Inherited from Observable.pipe*

*Defined in C:/Code/OpenSource/ngxs/node_modules/rxjs/internal/Observable.d.ts:74*

**Type parameters:**

#### A 
#### B 
#### C 
#### D 
**Parameters:**

| Name | Type |
| ------ | ------ |
| op1 | `OperatorFunction`<[ActionContext](../interfaces/_actions_stream_.actioncontext.md), `A`> |
| op2 | `OperatorFunction`<`A`, `B`> |
| op3 | `OperatorFunction`<`B`, `C`> |
| op4 | `OperatorFunction`<`C`, `D`> |

**Returns:** `Observable`<`D`>

*Inherited from Observable.pipe*

*Defined in C:/Code/OpenSource/ngxs/node_modules/rxjs/internal/Observable.d.ts:75*

**Type parameters:**

#### A 
#### B 
#### C 
#### D 
#### E 
**Parameters:**

| Name | Type |
| ------ | ------ |
| op1 | `OperatorFunction`<[ActionContext](../interfaces/_actions_stream_.actioncontext.md), `A`> |
| op2 | `OperatorFunction`<`A`, `B`> |
| op3 | `OperatorFunction`<`B`, `C`> |
| op4 | `OperatorFunction`<`C`, `D`> |
| op5 | `OperatorFunction`<`D`, `E`> |

**Returns:** `Observable`<`E`>

*Inherited from Observable.pipe*

*Defined in C:/Code/OpenSource/ngxs/node_modules/rxjs/internal/Observable.d.ts:76*

**Type parameters:**

#### A 
#### B 
#### C 
#### D 
#### E 
#### F 
**Parameters:**

| Name | Type |
| ------ | ------ |
| op1 | `OperatorFunction`<[ActionContext](../interfaces/_actions_stream_.actioncontext.md), `A`> |
| op2 | `OperatorFunction`<`A`, `B`> |
| op3 | `OperatorFunction`<`B`, `C`> |
| op4 | `OperatorFunction`<`C`, `D`> |
| op5 | `OperatorFunction`<`D`, `E`> |
| op6 | `OperatorFunction`<`E`, `F`> |

**Returns:** `Observable`<`F`>

*Inherited from Observable.pipe*

*Defined in C:/Code/OpenSource/ngxs/node_modules/rxjs/internal/Observable.d.ts:77*

**Type parameters:**

#### A 
#### B 
#### C 
#### D 
#### E 
#### F 
#### G 
**Parameters:**

| Name | Type |
| ------ | ------ |
| op1 | `OperatorFunction`<[ActionContext](../interfaces/_actions_stream_.actioncontext.md), `A`> |
| op2 | `OperatorFunction`<`A`, `B`> |
| op3 | `OperatorFunction`<`B`, `C`> |
| op4 | `OperatorFunction`<`C`, `D`> |
| op5 | `OperatorFunction`<`D`, `E`> |
| op6 | `OperatorFunction`<`E`, `F`> |
| op7 | `OperatorFunction`<`F`, `G`> |

**Returns:** `Observable`<`G`>

*Inherited from Observable.pipe*

*Defined in C:/Code/OpenSource/ngxs/node_modules/rxjs/internal/Observable.d.ts:78*

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

| Name | Type |
| ------ | ------ |
| op1 | `OperatorFunction`<[ActionContext](../interfaces/_actions_stream_.actioncontext.md), `A`> |
| op2 | `OperatorFunction`<`A`, `B`> |
| op3 | `OperatorFunction`<`B`, `C`> |
| op4 | `OperatorFunction`<`C`, `D`> |
| op5 | `OperatorFunction`<`D`, `E`> |
| op6 | `OperatorFunction`<`E`, `F`> |
| op7 | `OperatorFunction`<`F`, `G`> |
| op8 | `OperatorFunction`<`G`, `H`> |

**Returns:** `Observable`<`H`>

*Inherited from Observable.pipe*

*Defined in C:/Code/OpenSource/ngxs/node_modules/rxjs/internal/Observable.d.ts:79*

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

| Name | Type |
| ------ | ------ |
| op1 | `OperatorFunction`<[ActionContext](../interfaces/_actions_stream_.actioncontext.md), `A`> |
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

*Defined in C:/Code/OpenSource/ngxs/node_modules/rxjs/internal/Observable.d.ts:80*

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

| Name | Type |
| ------ | ------ |
| op1 | `OperatorFunction`<[ActionContext](../interfaces/_actions_stream_.actioncontext.md), `A`> |
| op2 | `OperatorFunction`<`A`, `B`> |
| op3 | `OperatorFunction`<`B`, `C`> |
| op4 | `OperatorFunction`<`C`, `D`> |
| op5 | `OperatorFunction`<`D`, `E`> |
| op6 | `OperatorFunction`<`E`, `F`> |
| op7 | `OperatorFunction`<`F`, `G`> |
| op8 | `OperatorFunction`<`G`, `H`> |
| op9 | `OperatorFunction`<`H`, `I`> |
| `Rest` operations | `OperatorFunction`<`any`, `any`>[] |

**Returns:** `Observable`<`__type`>

___
<a id="subscribe"></a>

###  subscribe

▸ **subscribe**(observer?: *`PartialObserver`<[ActionContext](../interfaces/_actions_stream_.actioncontext.md)>*): `Subscription`

▸ **subscribe**(next?: *`function`*, error?: *`function`*, complete?: *`function`*): `Subscription`

*Inherited from Observable.subscribe*

*Defined in C:/Code/OpenSource/ngxs/node_modules/rxjs/internal/Observable.d.ts:46*

**Parameters:**

| Name | Type |
| ------ | ------ |
| `Optional` observer | `PartialObserver`<[ActionContext](../interfaces/_actions_stream_.actioncontext.md)> |

**Returns:** `Subscription`

*Inherited from Observable.subscribe*

*Defined in C:/Code/OpenSource/ngxs/node_modules/rxjs/internal/Observable.d.ts:47*

**Parameters:**

| Name | Type |
| ------ | ------ |
| `Optional` next | `function` |
| `Optional` error | `function` |
| `Optional` complete | `function` |

**Returns:** `Subscription`

___
<a id="topromise"></a>

###  toPromise

▸ **toPromise**<`T`>(this: *`Observable`<`T`>*): `Promise`<`T`>

▸ **toPromise**<`T`>(this: *`Observable`<`T`>*, PromiseCtor: *`PromiseConstructor`*): `Promise`<`T`>

▸ **toPromise**<`T`>(this: *`Observable`<`T`>*, PromiseCtor: *`PromiseConstructorLike`*): `Promise`<`T`>

*Inherited from Observable.toPromise*

*Defined in C:/Code/OpenSource/ngxs/node_modules/rxjs/internal/Observable.d.ts:81*

**Type parameters:**

#### T 
**Parameters:**

| Name | Type |
| ------ | ------ |
| this | `Observable`<`T`> |

**Returns:** `Promise`<`T`>

*Inherited from Observable.toPromise*

*Defined in C:/Code/OpenSource/ngxs/node_modules/rxjs/internal/Observable.d.ts:82*

**Type parameters:**

#### T 
**Parameters:**

| Name | Type |
| ------ | ------ |
| this | `Observable`<`T`> |
| PromiseCtor | `PromiseConstructor` |

**Returns:** `Promise`<`T`>

*Inherited from Observable.toPromise*

*Defined in C:/Code/OpenSource/ngxs/node_modules/rxjs/internal/Observable.d.ts:83*

**Type parameters:**

#### T 
**Parameters:**

| Name | Type |
| ------ | ------ |
| this | `Observable`<`T`> |
| PromiseCtor | `PromiseConstructorLike` |

**Returns:** `Promise`<`T`>

___
<a id="unsubscribe"></a>

###  unsubscribe

▸ **unsubscribe**(): `void`

*Inherited from Subject.unsubscribe*

*Defined in C:/Code/OpenSource/ngxs/node_modules/rxjs/internal/Subject.d.ts:35*

**Returns:** `void`

___


/* tslint:disable:max-line-length */
/// <reference types="@types/jest" />
import { TestBed } from '@angular/core/testing';
import { Action, InitState, UpdateState, NgxsModule, State, Store } from '@ngxs/store';

import { assertType } from './utils/assert-type';

describe('[TEST]: Action Types', () => {
  let store: Store;

  class FooAction {
    public type = 'FOO';

    constructor(public payload: string) {}
  }

  class BarAction {
    public static type = 'BAR';

    constructor(public payload: string) {}
  }

  beforeAll(() => {
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot()]
    });

    store = TestBed.get(Store);
  });

  it('should be correct type in action decorator', () => {
    assertType(() => Action(UpdateState)); // $ExpectType MethodDecorator
    assertType(() => Action(new FooAction('payload'))); // $ExpectType MethodDecorator
    assertType(() => Action({ type: 'foo' })); // $ExpectType MethodDecorator
    assertType(() => Action([])); // $ExpectType MethodDecorator
    assertType(() => Action(BarAction)); // $ExpectType MethodDecorator
    assertType(() => Action([InitState, UpdateState])); // $ExpectType MethodDecorator
    assertType(() => Action([InitState], { cancelUncompleted: true })); // $ExpectType MethodDecorator
    assertType(() => Action(new BarAction('foo'))); // $ExpectError
    assertType(() => Action([{ foo: 'bar' }])); // $ExpectError
    assertType(() => Action([InitState, UpdateState], { foo: 'bar' })); // $ExpectError
    assertType(() => Action()); // $ExpectError
  });

  it('should be success or compile error when property type is missing', () => {
    assertType(() => Action({})); // $ExpectError

    class MyActionWithMissingType {}
    assertType(() => Action([MyActionWithMissingType])); // $ExpectError

    class MyAction {
      public static type = 'MY_ACTION';
    }
    assertType(() => Action([MyAction])); // $ExpectType MethodDecorator

    class RequiredOnlyStaticType {
      public type = 'anything';
    }
    assertType(() => Action([RequiredOnlyStaticType])); // $ExpectError
  });

  it('should be correct type in dispatch', () => {
    assertType(() => store.dispatch([])); // $ExpectType Observable<any>
    assertType(() => store.dispatch(new FooAction('payload'))); // $ExpectError Actions
    assertType(() => store.dispatch(new BarAction('foo'))); // $ExpectError Actions
    assertType(() => store.dispatch()); // $ExpectError
    assertType(() => store.dispatch({})); // $ExpectType Observable<any>
  });

  it('should prevent invalid types passed through', () => {
    class Increment {
      static type = 'INCREMENT';
    }

    @State<number>({
      name: 'counter',
      defaults: 0
    })
    class MyState {
      @Action(Increment) increment1() {} // $ExpectType () => void
      @Action({ type: 'INCREMENT' }) increment2() {} // $ExpectType () => void
      @Action(new Increment()) increment3() {} // $ExpectError
      @Action({ foo: 123 }) increment4() {} // $ExpectError
    }

    assertType(() => store.dispatch(new Increment())); // $ExpectType Observable<any>
    assertType(() => store.dispatch({ type: 'INCREMENT' })); // $ExpectType Observable<any>
    assertType(() => store.dispatch(Increment)); // $ExpectType Observable<any>
    assertType(() => store.dispatch({ foo: 123 })); // $ExpectType Observable<any>
  });

  it('should be correct type base API', () => {
    assertType(() => store.snapshot()); // $ExpectType any
    assertType(() => store.subscribe()); // $ExpectType Subscription
    assertType(() => store.reset({})); // $ExpectType any
    assertType(() => store.reset()); // $ExpectError
  });
});

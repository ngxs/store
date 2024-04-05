/// <reference types="@types/jest" />
import { TestBed } from '@angular/core/testing';
import { Action, InitState, UpdateState, NgxsModule, State, Store, dispatch } from '@ngxs/store';

import { assertType } from './utils/assert-type';

describe('[TEST]: Action Types', () => {
  let store: Store;

  class FooAction {
    type = 'FOO';

    constructor(public payload: string) {}
  }

  class BarAction {
    static type = 'BAR';

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
      static type = 'MY_ACTION';
    }
    assertType(() => Action([MyAction])); // $ExpectType MethodDecorator

    class RequiredOnlyStaticType {
      type = 'anything';
    }
    assertType(() => Action([RequiredOnlyStaticType])); // $ExpectError
  });

  it('should expect types for store.dispatch', () => {
    assertType(() => store.dispatch([])); // $ExpectType Observable<void>
    assertType(() => store.dispatch(new FooAction('payload'))); // $ExpectType Observable<void>
    assertType(() => store.dispatch(new BarAction('foo'))); // $ExpectType Observable<void>
    assertType(() => store.dispatch()); // $ExpectError
    assertType(() => store.dispatch({})); // $ExpectType Observable<void>
  });

  describe('dispatch', () => {
    class OneArgumentAction {
      static type = 'OneArgumentAction';

      constructor(payload: string) {}
    }

    class ManyArgumentsAction {
      static type = 'ManyArguments';

      constructor(arg_1: string, arg_2: number, arg_3: symbol) {}
    }

    it('should expect types for dispatch', () => {
      dispatch([]); // $ExpectError
      dispatch(); // $ExpectError
      dispatch({}); // $ExpectError
      dispatch(FooAction); // $ExpectError
      dispatch(OneArgumentAction); // $ExpectType (payload: string) => Observable<void>
      dispatch(ManyArgumentsAction); // $ExpectType (arg_1: string, arg_2: number, arg_3: symbol) => Observable<void>
    });
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

    assertType(() => store.dispatch(new Increment())); // $ExpectType Observable<void>
    assertType(() => store.dispatch({ type: 'INCREMENT' })); // $ExpectType Observable<void>
    assertType(() => store.dispatch(Increment)); // $ExpectType Observable<void>
    assertType(() => store.dispatch({ foo: 123 })); // $ExpectType Observable<void>
  });

  it('should be correct type base API', () => {
    assertType(() => store.snapshot()); // $ExpectType any
    assertType(() => store.subscribe()); // $ExpectType Subscription
    assertType(() => store.reset({})); // $ExpectType void
    assertType(() => store.reset()); // $ExpectError
  });
});

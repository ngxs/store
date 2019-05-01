/// <reference types="@types/jasmine" />
import { TestBed } from '@angular/core/testing';
import { ActionType } from '../../src/actions/symbols';
import { Action } from '../../src/decorators/action';
import { InitState, UpdateState } from '../../src/actions/actions';
import { NgxsModule, State, Store } from '../../src/public_api';
import {
  ActionTypeExpect,
  DispatchTypeExpect,
  FooTestTypeAction
} from './helpers/store-types.helpers';
import { assertType } from './utils/assert-type';

describe('[TEST]: Action Types', () => {
  let store: Store;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot()]
    });

    store = TestBed.get(Store);
  });

  it('should be correct type set in action decorator', () => {
    assertType(() => Action(new FooTestTypeAction('payload'))); // $ExpectType TargetAction
    assertType((action: ActionType): ActionType => action); // $ExpectType ActionType<any, any>
    assertType(() => ActionTypeExpect(new FooTestTypeAction('world'))); // $ExpectType Actions
    assertType(() => ActionTypeExpect([{ staticMethod: 1 }, { any: 'world' }])); // $ExpectType Actions
    assertType(() => ActionTypeExpect(UpdateState)); // $ExpectType Actions
    assertType(() => ActionTypeExpect([InitState, UpdateState])); // $ExpectType Actions
    assertType(() => ActionTypeExpect([InitState, UpdateState], { any: 'value' })); // $ExpectError
    assertType(() => ActionTypeExpect()); // $ExpectError
  });

  it('should be correct dispatch', () => {
    assertType(() => store.dispatch([])); // $ExpectType Observable<any>
    assertType(() => DispatchTypeExpect()); // $ExpectError
    assertType(() => DispatchTypeExpect(new FooTestTypeAction('payload'))); // $ExpectError Actions
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
      @Action(Increment) increment1() {}
      @Action({ type: 'INCREMENT' }) increment2() {}
      @Action(new Increment()) increment3() {}
      @Action({ foo: 123 }) increment4() {}
    }

    assertType(() => store.dispatch(new Increment())); // $ExpectType Observable<any>
    assertType(() => store.dispatch({ type: 'INCREMENT' })); // $ExpectType Observable<any>
    assertType(() => store.dispatch(Increment)); // $ExpectType Observable<any>
    assertType(() => store.dispatch({ foo: 123 })); // $ExpectType Observable<any>
  });
});

/// <reference types="@types/jasmine" />
import { TestBed } from '@angular/core/testing';
import {
  ActionDecorator,
  ActionOptions,
  Actions,
  ActionType
} from '../../src/actions/symbols';
import { Action as OriginalAction } from '../../src/decorators/action';
import { InitState, UpdateState } from '../../src/actions/actions';
import { NgxsModule, Store } from '../../src/public_api';
import { assertType } from './utils/assert-type';

describe('[TEST]: Action Types', () => {
  class FooAction {
    public type: string;

    constructor(public payload: string) {}
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot()]
    });
  });

  it('should be correct type set in action decorator', () => {
    type Decorator = ActionDecorator<Actions>;
    const Action: Decorator = (actions: Actions, _: ActionOptions = {}): Actions => actions;

    assertType(() => OriginalAction(new FooAction('payload'))); // $ExpectType TargetAction
    assertType((action: ActionType): ActionType => action); // $ExpectType ActionType<any, any>
    assertType(() => Action(new FooAction('world'))); // $ExpectType Actions
    assertType(() => Action([{ staticMethod: 1 }, { any: 'world' }])); // $ExpectType Actions
    assertType(() => Action(UpdateState)); // $ExpectType Actions
    assertType(() => Action([InitState, UpdateState])); // $ExpectType Actions
    assertType(() => Action([InitState, UpdateState], { any: 'value' })); // $ExpectError
    assertType(() => Action()); // $ExpectError
  });

  it('should be correct dispatch', () => {
    const store: Store = TestBed.get(Store);
    const Dispatch = (actions: Actions): Actions => actions;
    assertType(() => store.dispatch([])); // $ExpectType Observable<any>
    assertType(() => Dispatch()); // $ExpectError
    assertType(() => Dispatch(new FooAction('payload'))); // // $ExpectError
  });
});

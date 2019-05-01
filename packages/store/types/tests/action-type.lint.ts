import { ActionOptions, ActionType } from '../../src/actions/symbols';

const foo = (action: ActionType): ActionType => action;
class FooAction {
  public type: string;
  constructor(public payload: string) {}
}

foo({}); // $ExpectError
foo({} as any); // $ExpectType ActionType
foo(new FooAction('world')); // $ExpectType ActionType

// noinspection JSUnusedLocalSymbols
function ActionDecorator(actions: ActionType | ActionType[], _options?: ActionOptions) {
  return actions;
}

class IncorrectAction {
  public static type: string;
}

ActionDecorator(new FooAction('hello'), {}); // $ExpectType ActionDef<any, any> | { type: string; } | ActionType[]
ActionDecorator(new FooAction('hello'), { foo: `hello` }); // $ExpectError
ActionDecorator(new IncorrectAction()); // $ExpectError

/* tslint:disable:max-line-length */
/// <reference types="@types/jest" />
import {
  ofAction,
  ofActionCanceled,
  ofActionCompleted,
  ofActionDispatched,
  ofActionErrored,
  ofActionSuccessful,
  Actions,
  ActionDef
} from '@ngxs/store';

describe('[TEST]: Action Operator Types', () => {
  let actions$: Actions;

  class ActionOne {
    static type = 'Action one'
  }

  class ActionTwo {
    static type = 'Action two';
  }

  const actionThree = {
    type: 'Action three' as const
  };

  const actionFour = {
    type: 'Action four'
  };

  class NotAnAction {
    public type = "type is not static";
  }

  const alsoNotAnAction = { }; // missing action

  it('ofAction()', () => {
    // Arrange & act & assert
    actions$.pipe(
      ofAction(ActionOne) // $ExpectType OperatorFunction<ActionContext<ActionOne>, ActionOne>
    );

    actions$.pipe(
      ofAction(ActionOne, ActionTwo) // $ExpectType OperatorFunction<ActionContext<ActionOne | ActionTwo>, ActionOne | ActionTwo>
    );

    actions$.pipe(
      ofAction(actionThree) // $ExpectType OperatorFunction<ActionContext<{ type: "Action three"; }>, { type: "Action three"; }>
    );

    actions$.pipe(
      ofAction(actionFour) // $ExpectType OperatorFunction<ActionContext<{ type: string; }>, { type: string; }>
    );

    actions$.pipe(
      ofAction([ActionOne, ActionTwo]) // $ExpectError
    );

    actions$.pipe(
      ofAction(NotAnAction) // $ExpectError
    );

    actions$.pipe(
      ofAction(alsoNotAnAction) // $ExpectError
    );
  });

  it('ofActionDispatched()', () => {
    // Arrange & act & assert
    actions$.pipe(
      ofActionDispatched(ActionOne) // $ExpectType OperatorFunction<ActionContext<ActionOne>, ActionOne>
    );

    actions$.pipe(
      ofActionDispatched(ActionOne, ActionTwo) // $ExpectType OperatorFunction<ActionContext<ActionOne | ActionTwo>, ActionOne | ActionTwo>
    );

    actions$.pipe(
      ofActionDispatched(actionThree) // $ExpectType OperatorFunction<ActionContext<{ type: "Action three"; }>, { type: "Action three"; }>
    );

    actions$.pipe(
      ofActionDispatched(actionFour) // $ExpectType OperatorFunction<ActionContext<{ type: string; }>, { type: string; }>
    );

    actions$.pipe(
      ofActionDispatched([ActionOne, ActionTwo]) // $ExpectError
    );

    actions$.pipe(
      ofActionDispatched(NotAnAction) // $ExpectError
    );

    actions$.pipe(
      ofActionDispatched(alsoNotAnAction) // $ExpectError
    );
  });

  it('ofActionDispatched() with a parameterized action type', () => {
    // Arrange & act & assert
    const enum SearchErrorType {
      Timeout
    }

    function getDispatchedAction(ActionDef: ActionDef<[errorType: SearchErrorType]>) {
      return actions$.pipe(
        ofActionDispatched(ActionDef)
      );
    }

    class GetProductCategoriesError {
      static readonly type = 'GetProductCategoriesError';

      constructor(readonly errorType: SearchErrorType) {}
    }

    getDispatchedAction(GetProductCategoriesError).subscribe(result => {
      const errorType = result.errorType; // $ExpectType any
    });
  });

  it('ofActionSuccessful()', () => {
    // Arrange & act & assert
    actions$.pipe(
      ofActionSuccessful(ActionOne) // $ExpectType OperatorFunction<ActionContext<ActionOne>, ActionOne>
    );

    actions$.pipe(
      ofActionSuccessful(ActionOne, ActionTwo) // $ExpectType OperatorFunction<ActionContext<ActionOne | ActionTwo>, ActionOne | ActionTwo>
    );

    actions$.pipe(
      ofActionSuccessful(actionThree) // $ExpectType OperatorFunction<ActionContext<{ type: "Action three"; }>, { type: "Action three"; }>
    );

    actions$.pipe(
      ofActionSuccessful(actionFour) // $ExpectType OperatorFunction<ActionContext<{ type: string; }>, { type: string; }>
    );

    actions$.pipe(
      ofActionSuccessful([ActionOne, ActionTwo]) // $ExpectError
    );

    actions$.pipe(
      ofActionSuccessful(NotAnAction) // $ExpectError
    );

    actions$.pipe(
      ofActionSuccessful(alsoNotAnAction) // $ExpectError
    );
  });

  it('ofActionCanceled()', () => {
    // Arrange & act & assert
    actions$.pipe(
      ofActionCanceled(ActionOne) // $ExpectType OperatorFunction<ActionContext<ActionOne>, ActionOne>
    );

    actions$.pipe(
      ofActionCanceled(ActionOne, ActionTwo) // $ExpectType OperatorFunction<ActionContext<ActionOne | ActionTwo>, ActionOne | ActionTwo>
    );

    actions$.pipe(
      ofActionCanceled(actionThree) // $ExpectType OperatorFunction<ActionContext<{ type: "Action three"; }>, { type: "Action three"; }>
    );

    actions$.pipe(
      ofActionCanceled(actionFour) // $ExpectType OperatorFunction<ActionContext<{ type: string; }>, { type: string; }>
    );

    actions$.pipe(
      ofActionCanceled([ActionOne, ActionTwo]) // $ExpectError
    );

    actions$.pipe(
      ofActionCanceled(NotAnAction) // $ExpectError
    );

    actions$.pipe(
      ofActionCanceled(alsoNotAnAction) // $ExpectError
    );
  });

  it('ofActionErrored()', () => {
    // Arrange & act & assert
    actions$.pipe(
      ofActionErrored(ActionOne) // $ExpectType OperatorFunction<ActionContext<ActionOne>, ActionCompletion<ActionOne, Error>>
    );

    actions$.pipe(
      ofActionErrored(ActionOne, ActionTwo) // $ExpectType OperatorFunction<ActionContext<ActionOne | ActionTwo>, ActionCompletion<ActionOne | ActionTwo, Error>>
    );

    actions$.pipe(
      ofActionErrored(actionThree) // $ExpectType OperatorFunction<ActionContext<{ type: "Action three"; }>, ActionCompletion<{ type: "Action three"; }, Error>>
    );

    actions$.pipe(
      ofActionErrored(actionFour) // $ExpectType OperatorFunction<ActionContext<{ type: string; }>, ActionCompletion<{ type: string; }, Error>>
    );

    actions$.pipe(
      ofActionErrored([ActionOne, ActionTwo]) // $ExpectError
    );

    actions$.pipe(
      ofActionErrored(NotAnAction) // $ExpectError
    );

    actions$.pipe(
      ofActionErrored(alsoNotAnAction) // $ExpectError
    );
  });

  it('ofActionCompleted()', () => {
    // Arrange & act & assert
    actions$.pipe(
      ofActionCompleted(ActionOne) // $ExpectType OperatorFunction<ActionContext<ActionOne>, ActionCompletion<ActionOne, Error>>
    );

    actions$.pipe(
      ofActionCompleted(ActionOne, ActionTwo) // $ExpectType OperatorFunction<ActionContext<ActionOne | ActionTwo>, ActionCompletion<ActionOne | ActionTwo, Error>>
    );

    actions$.pipe(
      ofActionCompleted(actionThree) // $ExpectType OperatorFunction<ActionContext<{ type: "Action three"; }>, ActionCompletion<{ type: "Action three"; }, Error>>
    );

    actions$.pipe(
      ofActionCompleted(actionFour) // $ExpectType OperatorFunction<ActionContext<{ type: string; }>, ActionCompletion<{ type: string; }, Error>>
    );

    actions$.pipe(
      ofActionCompleted([ActionOne, ActionTwo]) // $ExpectError
    );

    actions$.pipe(
      ofActionCompleted(NotAnAction) // $ExpectError
    );

    actions$.pipe(
      ofActionCompleted(alsoNotAnAction) // $ExpectError
    );
  });
});

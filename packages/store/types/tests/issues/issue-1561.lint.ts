import {
  Actions,
  ofAction,
  ofActionDispatched,
  ofActionSuccessful,
  ofActionCanceled,
  ofActionErrored,
  ofActionCompleted
} from '@ngxs/store';

describe('[TEST]: https://github.com/ngxs/store/issues/1561', () => {
  let actions$: Actions;

  class ActionOne {
    static type = 'Action one'
  }

  class ActionTwo {
    static type = 'Action two';
  }

  it('ofAction()', () => {
    // Arrange & act & assert
    actions$.pipe(
      ofAction(ActionOne) // $ExpectType OperatorFunction<ActionContext<any>, any>
    );

    actions$.pipe(
      ofAction(ActionOne, ActionTwo) // $ExpectType OperatorFunction<ActionContext<any>, any>
    );

    actions$.pipe(
      ofAction([ActionOne, ActionTwo]) // $ExpectError
    );
  });

  it('ofActionDispatched()', () => {
    // Arrange & act & assert
    actions$.pipe(
      ofActionDispatched(ActionOne) // $ExpectType OperatorFunction<ActionContext<any>, any>
    );

    actions$.pipe(
      ofActionDispatched(ActionOne, ActionTwo) // $ExpectType OperatorFunction<ActionContext<any>, any>
    );

    actions$.pipe(
      ofActionDispatched([ActionOne, ActionTwo]) // $ExpectError
    );
  });

  it('ofActionSuccessful()', () => {
    // Arrange & act & assert
    actions$.pipe(
      ofActionSuccessful(ActionOne) // $ExpectType OperatorFunction<ActionContext<any>, any>
    );

    actions$.pipe(
      ofActionSuccessful(ActionOne, ActionTwo) // $ExpectType OperatorFunction<ActionContext<any>, any>
    );

    actions$.pipe(
      ofActionSuccessful([ActionOne, ActionTwo]) // $ExpectError
    );
  });

  it('ofActionCanceled()', () => {
    // Arrange & act & assert
    actions$.pipe(
      ofActionCanceled(ActionOne) // $ExpectType OperatorFunction<ActionContext<any>, any>
    );

    actions$.pipe(
      ofActionCanceled(ActionOne, ActionTwo) // $ExpectType OperatorFunction<ActionContext<any>, any>
    );

    actions$.pipe(
      ofActionCanceled([ActionOne, ActionTwo]) // $ExpectError
    );
  });

  it('ofActionErrored()', () => {
    // Arrange & act & assert
    actions$.pipe(
      ofActionErrored(ActionOne) // $ExpectType OperatorFunction<ActionContext<any>, any>
    );

    actions$.pipe(
      ofActionErrored(ActionOne, ActionTwo) // $ExpectType OperatorFunction<ActionContext<any>, any>
    );

    actions$.pipe(
      ofActionErrored([ActionOne, ActionTwo]) // $ExpectError
    );
  });

  it('ofActionCompleted()', () => {
    // Arrange & act & assert
    actions$.pipe(
      ofActionCompleted(ActionOne) // $ExpectType OperatorFunction<ActionContext<any>, ActionCompletion<any, Error>>
    );

    actions$.pipe(
      ofActionCompleted(ActionOne, ActionTwo) // $ExpectType OperatorFunction<ActionContext<any>, ActionCompletion<any, Error>>
    );

    actions$.pipe(
      ofActionCompleted([ActionOne, ActionTwo]) // $ExpectError
    );
  });
})

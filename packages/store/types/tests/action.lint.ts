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

  const alsoNotAnAction = {}; // missing action

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

  describe('Action Operator Type Matching', () => {
    const enum CustomPropType {
      Timeout
    }

    // An action with the instance properties inferred from the constructor
    class ActionWithMatchingConstructor {
      static readonly type = 'ActionWithMatchingConstructor';

      constructor(readonly myArg: CustomPropType) {}
    }

    // An action where the constructor property name is different to the instance property
    class ActionWithMatchingConstructor_DiffProp {
      static readonly type = 'ActionWithMatchingConstructor_DiffProp';

      readonly myProp: CustomPropType

      constructor(myArg: CustomPropType) {
        this.myProp = myArg;
      }
    }

    // An action where the constructor argument name is different to the instance property
    class ActionWithMatchingProp_DiffConstructor {
      static readonly type = 'ActionWithMatchingProp_DiffConstructor';

      readonly myArg: CustomPropType

      constructor(myDifferentArg: CustomPropType) {
        this.myArg = myDifferentArg;
      }
    }

    // An action with an unmatching constructor
    class ActionWithNonMatchingArgNameConstructor {
      static readonly type = 'ActionWithNonMatchingArgNameConstructor';

      constructor(readonly myArgNamedDifferently: CustomPropType) {}
    }


    // An action with an unmatching constructor
    class ActionWithNonMatchingArgTypeConstructor {
      static readonly type = 'ActionWithNonMatchingArgTypeConstructor';

      constructor(readonly myArg: string) {}
    }

    it('ofActionDispatched() with a parameterized constructor action type match helper', () => {
      // Arrange

      function getDispatchedActionWithExplicitConstructor<T extends ActionDef<[myArg: CustomPropType]>>(ActionDef: T) {
        return actions$.pipe(
          ofActionDispatched(ActionDef)
        );
      }

      // Act & Assert

      // If we use a function to constrain T to a specific constructor signature, it still allows us to access the instance type properties
      getDispatchedActionWithExplicitConstructor(ActionWithMatchingConstructor).subscribe(result => {
        const myArg = result.myArg; // $ExpectType CustomPropType
      });

      // This demonstrates that the constructor shape has no bearing on the instance shape, which can be inferred through a generic type
      getDispatchedActionWithExplicitConstructor(ActionWithMatchingConstructor_DiffProp).subscribe(result => {
        const myArg = result.myArg; // $ExpectError
        const myProp = result.myProp; // $ExpectType CustomPropType
      });

      // This demonstrates that the constructor parameter names have no bearing on matching
      getDispatchedActionWithExplicitConstructor(ActionWithNonMatchingArgNameConstructor).subscribe(result => {
        const myArg = result.myArg; // $ExpectError
        const myOtherArg = result.myArgNamedDifferently; // $ExpectType CustomPropType
      });

      // We should get an error if the constructor parameter types do not match
      getDispatchedActionWithExplicitConstructor(ActionWithNonMatchingArgTypeConstructor); // $ExpectError
    });

    it('ofActionDispatched() directly constrained with a parameterized constructor match only', () => {
      // Arrange & act & assert      

      // If we attempt just a constructor constraint with no generic to infer the instance properties, we get an `any` type
      actions$.pipe(ofActionDispatched<[ActionDef<[myArg: CustomPropType]>]>(ActionWithMatchingConstructor)).subscribe(result => {
        // This is to demonstrate that if a constructor is explicitly specified without the instance props, it receives any instance shape
        const myArg = result.myArg; // $ExpectType any
        const thisIsBad = result.someNonExistingProp; // $ExpectType any
      });
      // Same here
      actions$.pipe(ofActionDispatched<[ActionDef<[myArg: CustomPropType]>]>(ActionWithMatchingConstructor_DiffProp)).subscribe(result => {
        const myArg = result.myProp; // $ExpectType any
        const thisIsBad = result.someNonExistingProp; // $ExpectType any
      });
      // Same here
      actions$.pipe(ofActionDispatched<[ActionDef<[myArg: CustomPropType]>]>(ActionWithNonMatchingArgNameConstructor)).subscribe(result => {
        const myArg = result.myArgNamedDifferently; // $ExpectType any
        const thisIsBad = result.someNonExistingProp; // $ExpectType any
      });
      // We should get an error if the constructor parameter types do not match
      actions$.pipe(ofActionDispatched<[ActionDef<[myArg: CustomPropType]>]>(ActionWithNonMatchingArgTypeConstructor)); // $ExpectError
    });

    it('ofActionDispatched() directly constrained with an instance shape match only', () => {
      // Arrange & act & assert

      // If we constrain the instance properties, we get the correct prop types, but any constructor
      actions$.pipe(ofActionDispatched<[ActionDef<any[], { myArg: CustomPropType }>]>(ActionWithMatchingConstructor)).subscribe(result => {
        const myArg = result.myArg; // $ExpectType CustomPropType
        const thisWillError = result.someNonExistingProp; // $ExpectError
      });
      // If we constrain the instance properties, we get the correct prop types, but any constructor
      actions$.pipe(ofActionDispatched<[ActionDef<any[], { myArg: CustomPropType }>]>(ActionWithMatchingProp_DiffConstructor)).subscribe(result => {
        const myArg = result.myArg; // $ExpectType CustomPropType
        const thisWillError = result.someNonExistingProp; // $ExpectError
      });
      // Same here
      actions$.pipe(ofActionDispatched<[ActionDef<any[], { myProp: CustomPropType }>]>(ActionWithMatchingConstructor_DiffProp)).subscribe(result => {
        const myProp = result.myProp; // $ExpectType CustomPropType
        const thisWillError = result.someNonExistingProp; // $ExpectError
      });
      // Same here
      actions$.pipe(ofActionDispatched<[ActionDef<any[], { myArgNamedDifferently: CustomPropType }>]>(ActionWithNonMatchingArgNameConstructor)).subscribe(result => {
        const myArg = result.myArgNamedDifferently; // $ExpectType CustomPropType
        const thisWillError = result.someNonExistingProp; // $ExpectError
      });
      // Same here
      actions$.pipe(ofActionDispatched<[ActionDef<any[], { myArg: string }>]>(ActionWithNonMatchingArgTypeConstructor)).subscribe(result => {
        const myArg = result.myArg; // $ExpectType string
        const thisWillError = result.someNonExistingProp; // $ExpectError
      });
      // We should get an error if the instance prop names do not match
      actions$.pipe(ofActionDispatched<[ActionDef<any[], { myArg: CustomPropType }>]>(ActionWithNonMatchingArgNameConstructor)); // $ExpectError
      // We should get an error if the instance prop types do not match
      actions$.pipe(ofActionDispatched<[ActionDef<any[], { myArg: CustomPropType }>]>(ActionWithNonMatchingArgTypeConstructor)); // $ExpectError
    });

    it('ofActionDispatched() directly constrained with a constructor and instance shape match', () => {
      // Arrange & act & assert      

      // If we constrain both the constructor and instance properties, we get full type control
      actions$.pipe(ofActionDispatched<[ActionDef<[myArg: CustomPropType], { myArg: CustomPropType }>]>(ActionWithMatchingConstructor)).subscribe(result => {
        const myArg = result.myArg; // $ExpectType CustomPropType
        const thisWillError = result.someNonExistingProp; // $ExpectError
      });
      // Same here
      actions$.pipe(ofActionDispatched<[ActionDef<[myArg: CustomPropType], { myProp: CustomPropType }>]>(ActionWithMatchingConstructor_DiffProp)).subscribe(result => {
        const myArg = result.myProp; // $ExpectType CustomPropType
        const thisIsBad = result.someNonExistingProp; // $ExpectError
      });
      // Same here, but note that the arg name doesn't matter in the constructor constraint
      actions$.pipe(ofActionDispatched<[ActionDef<[myArg: CustomPropType], { myArgNamedDifferently: CustomPropType }>]>(ActionWithNonMatchingArgNameConstructor)).subscribe(result => {
        const myArg = result.myArgNamedDifferently; // $ExpectType CustomPropType
        const thisIsBad = result.someNonExistingProp; // $ExpectError
      });
      // Same here, the constructor argument name doesn't matter
      actions$.pipe(ofActionDispatched<[ActionDef<[myArg: CustomPropType], { myArg: CustomPropType }>]>(ActionWithMatchingProp_DiffConstructor)).subscribe(result => {
        const myArg = result.myArg; // $ExpectType CustomPropType
        const thisWillError = result.someNonExistingProp; // $ExpectError
      });
      // We should get an error if the constructor parameter types do not match
      actions$.pipe(ofActionDispatched<[ActionDef<[myArg: CustomPropType], { myArg: string }>]>(ActionWithNonMatchingArgTypeConstructor)); // $ExpectError
      // We should get an error if the instance prop types do not match
      actions$.pipe(ofActionDispatched<[ActionDef<[myArg: string], { myArg: CustomPropType }>]>(ActionWithNonMatchingArgTypeConstructor)); // $ExpectError
    });
  });
});

import {
  ofActionDispatched,
  ofActionCanceled,
  ofActionErrored,
  ofActionCompleted,
  ofActionSuccessful,
  ofAction
} from '../../src/operators/of-action';

describe(`ofAction*`, () => {
  class MyAction {
    static type = 'My Action';
  }

  const ofActionTestCases = [
    {
      name: 'ofAction',
      createOperator: (...args: any[]) => ofAction(...args)
    },
    {
      name: 'ofActionDispatched',
      createOperator: (...args: any[]) => ofActionDispatched(...args)
    },
    {
      name: 'ofActionCanceled',
      createOperator: (...args: any[]) => ofActionCanceled(...args)
    },
    {
      name: 'ofActionErrored',
      createOperator: (...args: any[]) => ofActionErrored(...args)
    },
    {
      name: 'ofActionSuccessful',
      createOperator: (...args: any[]) => ofActionSuccessful(...args)
    },
    {
      name: 'ofActionCompleted',
      createOperator: (...args: any[]) => ofActionCompleted(...args)
    }
  ];

  ofActionTestCases.forEach(({ name, createOperator }) =>
    it(`should not allow an array to be passed as an action type to ${name}`, () => {
      // Arrange
      expect(() => {
        // Act
        createOperator([MyAction]);
        // Assert
      }).toThrow(
        'The ofAction* operators only accept actions as parameters and not as an array.'
      );
    })
  );
});

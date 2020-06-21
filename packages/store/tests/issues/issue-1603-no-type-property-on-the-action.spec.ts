import { TestBed } from '@angular/core/testing';
import { NgxsModule, State, Action, Store } from '@ngxs/store';
import { NGXS_STATE_FACTORY } from '@ngxs/store/internals';

describe('https://github.com/ngxs/store/issues/1603', () => {
  class MyAction {
    // P.S. it's a type declaration and not an assignment
    // expression because we want to test exactly this behaviour.
    static type: '[MyState] My action';
  }

  @State<string>({
    name: 'myState',
    defaults: 'STATE_VALUE'
  })
  class MyState {
    @Action(MyAction)
    handleAction(): void {}
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([MyState])]
    });
  });

  it('should throw an error when dispatched action does not have a type property', () => {
    // Arrange
    let message: string | null = null;
    const store = TestBed.inject(Store);

    // Act
    const stateFactory = TestBed.inject(NGXS_STATE_FACTORY);
    const originalInvokeActions = stateFactory.invokeActions;

    const spy = jest
      .spyOn(stateFactory, 'invokeActions')
      .mockImplementationOnce(function(this: unknown) {
        try {
          return originalInvokeActions.apply(this, arguments);
        } catch (error) {
          message = error.message;
        }
      });

    store.dispatch(new MyAction());

    try {
      // Assert
      expect(message).toContain(`This action doesn't have the static type property`);
    } finally {
      spy.mockRestore();
    }
  });
});

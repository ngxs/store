import { TestBed } from '@angular/core/testing';
import { NgxsModule, State, Action, Store, Actions, ofActionDispatched } from '@ngxs/store';

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
    store.dispatch(new MyAction()).subscribe({
      error: error => (message = error.message)
    });

    // Assert
    expect(message).toBe(`This action doesn't have a type property: MyAction`);
  });

  it('should throw an error when dispatched action (plain object) does not have a type property', () => {
    // Arrange
    let message: string | null = null;
    const store = TestBed.inject(Store);

    // Act
    store.dispatch({}).subscribe({
      error: error => (message = error.message)
    });

    // Assert
    expect(message).toBe(`This action doesn't have a type property: Object`);
  });

  it('should not interrupt code statements if error is thrown', () => {
    // Arrange
    class ActionWithType {
      static type = 'Action with type';
    }

    let message: string | null = null;
    let actionWithTypeHasBeenDispatched = false;

    const store = TestBed.inject(Store);
    const actions$ = TestBed.inject(Actions);

    // Act
    const subscription = actions$.pipe(ofActionDispatched(ActionWithType)).subscribe(() => {
      actionWithTypeHasBeenDispatched = true;
    });

    store.dispatch({}).subscribe({
      error: error => (message = error.message)
    });

    store.dispatch(new ActionWithType());

    // Assert
    expect(message).toEqual(`This action doesn't have a type property: Object`);
    expect(actionWithTypeHasBeenDispatched).toBeTruthy();

    subscription.unsubscribe();
  });
});

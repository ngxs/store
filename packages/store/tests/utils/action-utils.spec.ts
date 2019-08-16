import { declareAction } from '@ngxs/store/src/utils/action-utils';
import {
  Actions,
  NgxsModule,
  ofActionDispatched,
  State,
  StateContext,
  Store
} from '@ngxs/store';
import { TestBed } from '@angular/core/testing';
import { Observable } from 'rxjs';

describe('action-utils', () => {
  @State<{}>({
    name: 'actionUtilsStore',
    defaults: {
      name: 'morpheus'
    }
  })
  class ActionUtilsStore {}

  const Action = {
    A: { type: 'actionA' },
    B: { type: 'actionB' }
  };

  let store: Store;
  let actions$: Observable<any>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([ActionUtilsStore])]
    });

    store = TestBed.get(Store);
    actions$ = TestBed.get(Actions);
  });

  describe('declareAction()', () => {
    it('registers a new action on the store', () => {
      let counter = 0;
      const actionHandler = () => counter++;

      declareAction(ActionUtilsStore, Action.A, actionHandler);
      store.dispatch(Action.A);

      expect(counter).toBe(1);
    });

    it('combines multiple actions to one handler on the store', () => {
      let counter = 0;
      const actionHandler = () => counter++;

      declareAction(ActionUtilsStore, [Action.A, Action.B], actionHandler);
      store.dispatch(Action.A);
      store.dispatch(Action.B);

      expect(counter).toBe(2);
    });

    it('registers a new action on the store, which update the store', () => {
      const expectedName = 'davinci';

      declareAction(ActionUtilsStore, [Action.A], (ctx: StateContext<ActionUtilsStore>) => {
        ctx.patchState({ name: expectedName });
      });
      store.dispatch(Action.A);

      const actualName = store.selectSnapshot(s => s.actionUtilsStore.name);
      expect(actualName).toBe('davinci');
    });

    it('registers a new action on the store, which will also triggers Action Handlers', () => {
      let actionHandlerTriggered = 0;
      actions$.pipe(ofActionDispatched(Action.A)).subscribe(() => {
        actionHandlerTriggered++;
      });

      declareAction(ActionUtilsStore, [Action.A], () => {});
      store.dispatch(Action.A);

      expect(actionHandlerTriggered).toBe(1);
    });

    it('throws Error if no valid store is provided', () => {
      const invalidStore = {};
      const declareActionWithValidStore = () =>
        declareAction(invalidStore, [Action.A, Action.B], () => {});

      expect(declareActionWithValidStore).toThrow();
    });
  });
});

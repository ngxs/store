import { TestBed } from '@angular/core/testing';
import { provideStore, Store } from '@ngxs/store';
import { TodoState, TodoStateModel } from './todo.state';

describe('Store store', () => {
  let store: Store;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideStore([TodoState])]
    });

    store = TestBed.inject(Store);
  });

  // it('should create an action and add an item', () => {
  //   const expected: TodoStateModel = {
  //     todos: []
  //   };
  //   store.dispatch(new StoreAction('item-1'));
  //   const actual = store.selectSnapshot(StoreState.getState);
  //   expect(actual).toEqual(expected);
  // });
});

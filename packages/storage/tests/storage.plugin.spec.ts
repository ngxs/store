import { TestBed } from '@angular/core/testing';

import { NgxsModule, State, Store, Action } from '@ngxs/store';

import { NgxsStoragePluginModule } from '../';

describe('NgxsStoragePlugin', () => {
  let store: Store;

  class Increment {}

  class Decrement {}

  interface StateModel {
    count: number;
  }

  @State<StateModel>({
    name: 'counter',
    defaults: { count: 0 }
  })
  class MyStore {
    @Action(Increment)
    increment({ getState, setState }) {
      const state = getState();
      setState({
        count: Number(state.count) + 1
      });
    }

    @Action(Decrement)
    decrement({ getState, setState }) {
      const state = getState();
      setState({
        count: Number(state.count) - 1
      });
    }
  }

  beforeEach(() => {
    localStorage.setItem('@@STATE', JSON.stringify({ counter: { count: 100 } }));

    TestBed.configureTestingModule({
      imports: [
        NgxsModule.forRoot([MyStore]),
        NgxsStoragePluginModule.forRoot(),
      ]
    });

    store = TestBed.get(Store);
  });

  afterEach(() => {
    localStorage.removeItem('@@STATE');
  });

  it('should get initial data from localstorage', () => {
    localStorage.setItem('@@STATE', JSON.stringify({ counter: { count: 100 } }));

    store.select(state => state.counter).subscribe((state: StateModel) => {
      expect(state.count).toBe(100);
    });
  });

  it('should save data to localstorage', () => {
    store.dispatch(new Increment());
    store.dispatch(new Increment());
    store.dispatch(new Increment());
    store.dispatch(new Increment());
    store.dispatch(new Increment());

    store.select(state => state.counter).subscribe((state: StateModel) => {
      expect(state.count).toBe(105);

      expect(localStorage.getItem('@@STATE')).toBe(JSON.stringify({ counter: { count: 105 } }));
    });
  });
});

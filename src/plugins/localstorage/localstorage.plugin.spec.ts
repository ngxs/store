import { TestBed } from '@angular/core/testing';

import { NgxsModule, LocalStoragePluginModule, Store, Mutation, Ngxs } from 'ngxs';

describe('LocalStoragePlugin', () => {
  let ngxs: Ngxs;

  class Increment {}

  class Decrement {}

  interface State {
    count: number;
  }

  @Store<State>({
    name: 'counter',
    defaults: { count: 0 }
  })
  class MyStore {
    @Mutation(Increment)
    increment(state: State) {
      return {
        count: Number(state.count) + 1
      };
    }

    @Mutation(Decrement)
    decrement(state: State) {
      return {
        count: Number(state.count) - 1
      };
    }
  }

  beforeEach(() => {
    localStorage.setItem('@@STATE', JSON.stringify({ counter: { count: 100 } }));

    TestBed.configureTestingModule({
      imports: [LocalStoragePluginModule.forRoot(), NgxsModule.forRoot([MyStore])]
    });

    ngxs = TestBed.get(Ngxs);
  });

  afterEach(() => {
    localStorage.removeItem('@@STATE');
  });

  it('should get initial data from localstorage', () => {
    localStorage.setItem('@@STATE', JSON.stringify({ counter: { count: 100 } }));

    ngxs.select(state => state.counter).subscribe((state: State) => {
      expect(state.count).toBe(100);
    });
  });

  it('should save data to localstorage', () => {
    ngxs.dispatch(new Increment());
    ngxs.dispatch(new Increment());
    ngxs.dispatch(new Increment());
    ngxs.dispatch(new Increment());
    ngxs.dispatch(new Increment());

    ngxs.select(state => state.counter).subscribe((state: State) => {
      expect(state.count).toBe(105);

      expect(localStorage.getItem('@@STATE')).toBe(JSON.stringify({ counter: { count: 105 } }));
    });
  });
});

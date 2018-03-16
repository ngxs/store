import { TestBed } from '@angular/core/testing';

import { NgxsModule } from '../../lib/module';
import { State } from '../../lib/state';
import { Store } from '../../lib/store';
import { Action } from '../../lib/action';
import { StateContext } from '../../lib/symbols';

import { LocalStoragePluginModule } from './localstorage.module';

describe('LocalStoragePlugin', () => {
  let ngxs: Store;

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
    increment({ state, setState }: StateContext<StateModel>) {
      setState({ count: state.count + 1 });
    }

    @Action(Decrement)
    decrement({ state, setState }: StateContext<StateModel>) {
      setState({ count: state.count - 1 });
    }
  }

  beforeEach(() => {
    localStorage.setItem('@@STATE', JSON.stringify({ counter: { count: 100 } }));

    TestBed.configureTestingModule({
      imports: [LocalStoragePluginModule.forRoot(), NgxsModule.forRoot([MyStore])]
    });

    ngxs = TestBed.get(Store);
  });

  afterEach(() => {
    localStorage.removeItem('@@STATE');
  });

  it('should get initial data from localstorage', () => {
    localStorage.setItem('@@STATE', JSON.stringify({ counter: { count: 100 } }));

    ngxs.select(state => state.counter).subscribe((state: StateModel) => {
      expect(state.count).toBe(100);
    });
  });

  it('should save data to localstorage', () => {
    ngxs.dispatch(new Increment());
    ngxs.dispatch(new Increment());
    ngxs.dispatch(new Increment());
    ngxs.dispatch(new Increment());
    ngxs.dispatch(new Increment());

    ngxs.select(state => state.counter).subscribe((state: StateModel) => {
      expect(state.count).toBe(105);

      expect(localStorage.getItem('@@STATE')).toBe(JSON.stringify({ counter: { count: 105 } }));
    });
  });
});

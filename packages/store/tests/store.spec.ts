import { TestBed } from '@angular/core/testing';
import { Observable } from 'rxjs';

import { Store } from '../src/store';
import { NgxsModule } from '../src/module';
import { State } from '../src/state';
import { Action } from '../src/action';

describe('Store', () => {
  interface SubSubStateModel {
    name: string;
  }

  interface SubStateModel {
    hello: boolean;
    world: boolean;
    baz?: SubSubStateModel;
  }

  interface StateModel {
    first: string;
    second: string;
    bar?: SubStateModel;
  }

  class FooIt {}

  @State<SubSubStateModel>({
    name: 'baz',
    defaults: {
      name: 'Danny'
    }
  })
  class MySubSubState {}

  @State<SubStateModel>({
    name: 'bar',
    defaults: {
      hello: true,
      world: true
    },
    children: [MySubSubState]
  })
  class MySubState {}

  @State<StateModel>({
    name: 'foo',
    defaults: {
      first: 'Hello',
      second: 'World'
    },
    children: [MySubState]
  })
  class MyState {
    @Action(FooIt)
    fooIt({ setState }) {
      return new Observable(observer => {
        setState({ foo: 'bar' });

        observer.next();
        observer.complete();
      });
    }
  }

  let store: Store;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([MySubState, MySubSubState, MyState])]
    });

    store = TestBed.get(Store);
  });

  it('should subscribe to the root state', () => {
    store.subscribe(state => {
      expect(state).toEqual({
        foo: {
          first: 'Hello',
          second: 'World',
          bar: {
            hello: true,
            world: true,
            baz: {
              name: 'Danny'
            }
          }
        }
      });
    });
  });

  it('should select the correct state use a function', () => {
    store.select((state: { foo: StateModel }) => state.foo.first).subscribe(state => {
      expect(state).toBe('Hello');
    });
  });

  it('should select the correct state use a state class', () => {
    store.select(MyState).subscribe(state => {
      expect(state).toEqual({
        first: 'Hello',
        second: 'World',
        bar: {
          hello: true,
          world: true,
          baz: {
            name: 'Danny'
          }
        }
      });
    });

    store.select(MySubState).subscribe((state: SubStateModel) => {
      expect(state).toEqual({
        hello: true,
        world: true,
        baz: {
          name: 'Danny'
        }
      });
    });

    store.select(MySubSubState).subscribe((state: SubSubStateModel) => {
      expect(state).toEqual({
        name: 'Danny'
      });
    });
  });

  it('should not require you to subscrube in order to dispatch', () => {});
});

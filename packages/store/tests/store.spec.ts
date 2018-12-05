import { async, TestBed } from '@angular/core/testing';
import { Observable } from 'rxjs';

import { Store } from '../src/store';
import { NgxsModule } from '../src/module';
import { State } from '../src/decorators/state';
import { Action } from '../src/decorators/action';
import { StateContext } from '../src/symbols';

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

  interface OtherStateModel {
    under: string;
  }

  class FooIt {
    static type = 'FooIt';
  }

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
    fooIt({ setState }: StateContext<StateModel>) {
      return new Observable(observer => {
        setState({ foo: 'bar' } as any);

        observer.next();
        observer.complete();
      });
    }
  }

  @State<OtherStateModel>({
    name: 'under_',
    defaults: {
      under: 'score'
    }
  })
  class MyOtherState {}

  let store: Store;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([MySubState, MySubSubState, MyState, MyOtherState])]
    });

    store = TestBed.get(Store);
  });

  it('should subscribe to the root state', async(() => {
    store.subscribe((state: any) => {
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
        },
        under_: {
          under: 'score'
        }
      });
    });
  }));

  it('should select the correct state use a function', async(() => {
    store
      .select((state: { foo: StateModel }) => state.foo.first)
      .subscribe(state => {
        expect(state).toBe('Hello');
      });
  }));

  it('should select the correct state use a state class: Root State', async(() => {
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
  }));

  it('should select the correct state use a state class: Sub State', async(() => {
    // todo: remove any
    store.select<SubStateModel>(<any>MySubState).subscribe((state: SubStateModel) => {
      expect(state).toEqual({
        hello: true,
        world: true,
        baz: {
          name: 'Danny'
        }
      });
    });
  }));

  it('should select the correct state use a state class: Sub Sub State', async(() => {
    // todo: remove any
    store.select<SubSubStateModel>(<any>MySubSubState).subscribe((state: SubSubStateModel) => {
      expect(state).toEqual({
        name: 'Danny'
      });
    });
  }));

  it('should select snapshot state use a state class', async(() => {
    const state = store.selectSnapshot(MyState);
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
  }));

  it('should select state with an underscore in name', async(() => {
    const state = store.selectSnapshot(MyOtherState);
    expect(state).toEqual({
      under: 'score'
    });
  }));

  // it('should not require you to subscrube in order to dispatch', () => {});
});

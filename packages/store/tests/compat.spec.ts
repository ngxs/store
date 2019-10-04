import { async, TestBed } from '@angular/core/testing';
import { Action, NgxsModule, State, StateContext, Store } from '@ngxs/store';

describe('Compatibility options (implicit return state)', () => {
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
  class MySubState {
    @Action({ type: 'legacySetState' })
    legacySetState(ctx: StateContext<SubStateModel>): void {
      const result: SubStateModel = ctx.setState((state: SubStateModel) => ({
        ...state,
        hello: false,
        world: false
      }));

      expect(result).toEqual({
        under_: { under: 'score' },
        foo: {
          first: 'Hello',
          second: 'World',
          bar: { hello: false, world: false, baz: { name: 'Danny' } }
        }
      });
    }

    @Action({ type: 'featureSetState' })
    featureSetState(ctx: StateContext<SubStateModel>): void {
      const result: SubStateModel = ctx.setState((state: SubStateModel) => ({
        ...state,
        hello: false,
        world: false
      }));

      expect(result).toEqual({ hello: false, world: false, baz: { name: 'Danny' } });
    }
  }

  @State<StateModel>({
    name: 'foo',
    defaults: {
      first: 'Hello',
      second: 'World'
    },
    children: [MySubState]
  })
  class MyState {}

  @State<OtherStateModel>({
    name: 'under_',
    defaults: {
      under: 'score'
    }
  })
  class MyOtherState {}

  let store: Store;

  it('should be correct legacy setState with returned AppState from dispatch', async(() => {
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([MySubState, MySubSubState, MyState, MyOtherState])]
    });

    store = TestBed.get(Store);

    expect(store.snapshot()).toEqual({
      under_: { under: 'score' },
      foo: {
        first: 'Hello',
        second: 'World',
        bar: { hello: true, world: true, baz: { name: 'Danny' } }
      }
    });

    store.dispatch({ type: 'legacySetState' }).subscribe(state => {
      expect(state).toEqual({
        under_: { under: 'score' },
        foo: {
          first: 'Hello',
          second: 'World',
          bar: { hello: false, world: false, baz: { name: 'Danny' } }
        }
      });
    });
  }));

  it('should be correct feature setState with returned void from dispatch', async(() => {
    TestBed.configureTestingModule({
      imports: [
        NgxsModule.forRoot([MySubState, MySubSubState, MyState, MyOtherState], {
          compatibility: {
            strictContentSecurityPolicy: false,
            implicitReturnState: 'legacy_disabled'
          }
        })
      ]
    });

    store = TestBed.get(Store);

    expect(store.snapshot()).toEqual({
      under_: { under: 'score' },
      foo: {
        first: 'Hello',
        second: 'World',
        bar: { hello: true, world: true, baz: { name: 'Danny' } }
      }
    });

    store.dispatch({ type: 'featureSetState' }).subscribe((state: void) => {
      expect(state).toEqual(undefined);
    });
  }));
});

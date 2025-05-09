import { Injectable, ModuleWithProviders, NgModule, Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Store, NgxsModule, State, Action, StateContext } from '@ngxs/store';
import { Observable, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';

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
  @Injectable()
  class MySubSubState {}

  @State<SubStateModel>({
    name: 'bar',
    defaults: {
      hello: true,
      world: true
    },
    children: [MySubSubState]
  })
  @Injectable()
  class MySubState {}

  @State<StateModel>({
    name: 'foo',
    defaults: {
      first: 'Hello',
      second: 'World'
    },
    children: [MySubState]
  })
  @Injectable()
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
  @Injectable()
  class MyOtherState {}

  function setup(
    options: {
      preImports?: (ModuleWithProviders<any> | Type<any>)[];
    } = {}
  ) {
    TestBed.configureTestingModule({
      imports: [
        ...(options.preImports || []),
        NgxsModule.forRoot([MySubState, MySubSubState, MyState, MyOtherState])
      ]
    });

    const store = TestBed.inject(Store);
    return {
      store
    };
  }

  it('should subscribe to the root state', async () => {
    // Arrange
    const { store } = setup();
    // Assert
    const state = await new Promise(resolve => store.subscribe(resolve));
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

  it('should select the correct state use a function', async () => {
    // Arrange
    const { store } = setup();
    // Assert
    const state = await store
      .selectOnce((state: { foo: StateModel }) => state.foo.first)
      .toPromise();
    expect(state).toBe('Hello');
  });

  describe('[select]', () => {
    it('should select the correct state use a state class: Root State', async () => {
      // Arrange
      const { store } = setup();
      // Assert
      const state = await store.selectOnce(MyState).toPromise();
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

    it('should select the correct state use a state class: Sub State', async () => {
      // Arrange
      const { store } = setup();
      // Assert
      const state = await store.selectOnce<SubStateModel>(MySubState).toPromise();
      expect(state).toEqual({
        hello: true,
        world: true,
        baz: {
          name: 'Danny'
        }
      });
    });

    it('should select the correct state use a state class: Sub Sub State', async () => {
      // Arrange
      const { store } = setup();
      // Assert
      const state = await store.selectOnce<SubSubStateModel>(MySubSubState).toPromise();
      expect(state).toEqual({
        name: 'Danny'
      });
    });

    it('should select state even when called before state added', () => {
      // Arrange
      @Injectable()
      class CollectorService {
        collected: string[] = [];
        subscription: Subscription;
        constructor(private store: Store) {}

        startCollecting() {
          this.subscription = this.store
            .select(MyState)
            .pipe(
              tap((model: StateModel) => {
                this.collected.push(model?.first);
              })
            )
            .subscribe();
        }

        stop() {
          this.subscription?.unsubscribe();
        }
      }

      @NgModule({
        providers: [CollectorService]
      })
      class CollectorModule {
        constructor(service: CollectorService) {
          service.startCollecting();
        }
      }

      // Act
      setup({ preImports: [CollectorModule] });
      const collector = TestBed.inject(CollectorService);
      collector.stop();
      // Assert
      expect(collector.collected).toEqual([undefined, 'Hello']);
    });
  });

  describe('[selectSnapshot]', () => {
    it('should select snapshot state use a state class', () => {
      // Arrange
      const { store } = setup();
      // Act
      const state = store.selectSnapshot(MyState);
      // Assert
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

    it('should select state with an underscore in name', () => {
      // Arrange
      const { store } = setup();
      // Act
      const state = store.selectSnapshot(MyOtherState);
      // Assert
      expect(state).toEqual({
        under: 'score'
      });
    });
  });
});

import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Action, NgxsModule, State, StateContext, Store } from '@ngxs/store';
import { first } from 'rxjs/operators';

describe('State stream order of updates', () => {
  class GetProduct {
    static readonly type = 'Get product';

    constructor(readonly productId: number) {}
  }

  class SetPresentation {
    static readonly type = 'Set presentation';
  }

  type ProductsStateModel = {
    currentId?: number;
    products: Record<string, any>;
  };

  @State<any | null>({
    name: 'presentation',
    defaults: null
  })
  @Injectable()
  class PresentationState {
    @Action(SetPresentation)
    async setPresentation(ctx: StateContext<null | any>) {
      await Promise.resolve();
      ctx.setState({ this_is: 'random_object' });
    }
  }

  const recorder: any[] = [];

  @State<ProductsStateModel>({
    name: 'products',
    defaults: {
      currentId: 0,
      products: {}
    }
  })
  @Injectable()
  class ProductsState {
    @Action(GetProduct)
    async getProduct(ctx: StateContext<ProductsStateModel>, action: GetProduct) {
      ctx.patchState({ currentId: action.productId });
      recorder.push(['after patchState', ctx.getState()]);
      await Promise.resolve();
      recorder.push(['after microtask', ctx.getState()]);
    }
  }

  // Note: do not convert this unit test to `async-await` style, this explictly must have
  //       nested callbacks and the `done` call after all subscribers emit values.
  it('should not get the latest stream value when the patchState is called (because it is queued up)', done => {
    // Arrange
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([PresentationState, ProductsState])]
    });

    const store = TestBed.inject(Store);

    store
      .select(PresentationState)
      .pipe(first(Boolean))
      .subscribe(() => {
        store.dispatch(new GetProduct(222)).subscribe(() => {
          // Wrap in `try-catch` since `expect` throws errors synchronously and we
          // don't observe `Exceeded timeout of 5000 ms for a test` at the end, but
          // the actual error from expectation call.
          try {
            // Assert
            expect(recorder).toEqual([
              ['after patchState', { currentId: 222, products: {} }],
              ['after microtask', { currentId: 222, products: {} }]
            ]);

            done();
          } catch (error) {
            done(error);
          }
        });
      });

    // Act
    store.dispatch(new SetPresentation());
  });
});

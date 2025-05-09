import { ErrorHandler, Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { throwError } from 'rxjs';

import { NgxsModule, State, Action, Store, Actions, ofActionDispatched } from '@ngxs/store';

import { makeRxJSTimeoutProviderSynchronous } from '../helpers/make-rxjs-timeout-provider-synchronous';

describe('Allow to inject the Store class into the ErrorHandler (https://github.com/ngxs/store/issues/1687)', () => {
  makeRxJSTimeoutProviderSynchronous();

  it('should allow to inject the Store', async () => {
    // Arrange
    class ProduceError {
      static type = '[Animals] Produce error';
    }

    class HandleError {
      static type = '[Animals] Handle error';
    }

    @State({
      name: 'animals',
      defaults: []
    })
    @Injectable()
    class AnimalsState {
      @Action(ProduceError)
      produceError() {
        return throwError(new EvalError());
      }
    }

    let handleErrorHasBeenDispatched = false;

    // Act
    @Injectable()
    class MyErrorHandler implements ErrorHandler {
      constructor(private store: Store) {}

      handleError(): void {
        this.store.dispatch(new HandleError());
      }
    }

    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([AnimalsState])],
      providers: [{ provide: ErrorHandler, useClass: MyErrorHandler }]
    });

    const actions$ = TestBed.inject(Actions);

    const subscription = actions$.pipe(ofActionDispatched(HandleError)).subscribe(() => {
      handleErrorHasBeenDispatched = true;
    });

    TestBed.inject(Store).dispatch(new ProduceError());
    await Promise.resolve();

    // Assert
    expect(handleErrorHasBeenDispatched).toBe(true);
    subscription.unsubscribe();
  });
});

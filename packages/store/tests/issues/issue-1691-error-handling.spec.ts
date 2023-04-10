import { DoBootstrap, ErrorHandler, Injectable, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { freshPlatform, skipConsoleLogging } from '@ngxs/store/internals/testing';
import { Action, NgxsModule, State, Store } from '@ngxs/store';
import { defer, throwError } from 'rxjs';
import { tap } from 'rxjs/operators';

describe('Error handling (https://github.com/ngxs/store/issues/1691)', () => {
  class ProduceErrorSynchronously {
    static readonly type = 'Produce error synchronously';
  }

  class ProduceErrorSynchronouslyInStream {
    static readonly type = 'Produce error synchronously in stream';
  }

  class ProduceErrorAsynchronously {
    static readonly type = 'Produce error asynchronously';
  }

  const actionError = new RangeError('Custom NGXS error');

  @State({
    name: 'app'
  })
  @Injectable()
  class AppState {
    @Action(ProduceErrorSynchronously)
    produceErrorSynchronously() {
      throw actionError;
    }

    @Action(ProduceErrorSynchronouslyInStream)
    produceErrorSynchronouslyInStream() {
      return throwError(actionError);
    }

    @Action(ProduceErrorAsynchronously)
    produceErrorAsynchronously() {
      return defer(() => Promise.resolve()).pipe(
        tap(() => {
          throw actionError;
        })
      );
    }
  }

  @Injectable()
  class CustomErrorHandler implements ErrorHandler {
    caughtErrorsByErrorHandler: any[] = [];

    handleError(error: any): void {
      this.caughtErrorsByErrorHandler.push(error);
    }
  }

  @NgModule({
    imports: [BrowserModule, NgxsModule.forRoot([AppState])],
    providers: [CustomErrorHandler, { provide: ErrorHandler, useExisting: CustomErrorHandler }]
  })
  class TestModule implements DoBootstrap {
    ngDoBootstrap(): void {
      // Do not do anything.
    }
  }

  describe('observables', () => {
    it(
      'errors should be caught by ErrorHandler if there is no subscribe',
      freshPlatform(async () => {
        // Arrange
        const { injector } = await skipConsoleLogging(() =>
          platformBrowserDynamic().bootstrapModule(TestModule)
        );

        const store = injector.get(Store);
        const errorHandler = injector.get(CustomErrorHandler);

        // Act
        store.dispatch(new ProduceErrorSynchronously());
        await macrotask();
        // Assert
        expect(errorHandler.caughtErrorsByErrorHandler).toEqual([actionError]);

        // Act
        store.dispatch(new ProduceErrorSynchronouslyInStream());
        await macrotask();
        // Assert
        expect(errorHandler.caughtErrorsByErrorHandler).toEqual([actionError, actionError]);

        // Act
        store.dispatch(new ProduceErrorAsynchronously());
        await macrotask();
        // Assert
        expect(errorHandler.caughtErrorsByErrorHandler).toEqual([
          actionError,
          actionError,
          actionError
        ]);
      })
    );

    it(
      'errors should be caught by ErrorHandler if subscribe is empty',
      freshPlatform(async () => {
        // Arrange
        const { injector } = await skipConsoleLogging(() =>
          platformBrowserDynamic().bootstrapModule(TestModule)
        );

        const store = injector.get(Store);
        const errorHandler = injector.get(CustomErrorHandler);

        // Act
        store.dispatch(new ProduceErrorSynchronously()).subscribe();
        await macrotask();
        // Assert
        expect(errorHandler.caughtErrorsByErrorHandler).toEqual([actionError]);

        // Act
        store.dispatch(new ProduceErrorSynchronouslyInStream()).subscribe();
        await macrotask();
        // Assert
        expect(errorHandler.caughtErrorsByErrorHandler).toEqual([actionError, actionError]);

        // Act
        store.dispatch(new ProduceErrorAsynchronously()).subscribe();
        await macrotask();
        // Assert
        expect(errorHandler.caughtErrorsByErrorHandler).toEqual([
          actionError,
          actionError,
          actionError
        ]);
      })
    );

    it(
      'errors should NOT be caught by ErrorHandler if subscribe has error observer',
      freshPlatform(async () => {
        // Arrange
        const caughtErrors: any[] = [];
        const { injector } = await skipConsoleLogging(() =>
          platformBrowserDynamic().bootstrapModule(TestModule)
        );

        const store = injector.get(Store);
        const errorHandler = injector.get(CustomErrorHandler);

        // Act
        store.dispatch(new ProduceErrorSynchronously()).subscribe({
          error: error => caughtErrors.push(error)
        });
        await macrotask();
        // Assert
        expect(caughtErrors).toEqual([actionError]);
        expect(errorHandler.caughtErrorsByErrorHandler).toEqual([]);

        // Act
        store.dispatch(new ProduceErrorSynchronouslyInStream()).subscribe({
          error: error => caughtErrors.push(error)
        });
        await macrotask();
        // Assert
        expect(caughtErrors).toEqual([actionError, actionError]);
        expect(errorHandler.caughtErrorsByErrorHandler).toEqual([]);

        // Act
        store.dispatch(new ProduceErrorAsynchronously()).subscribe({
          error: error => caughtErrors.push(error)
        });
        await macrotask();
        // Assert
        expect(caughtErrors).toEqual([actionError, actionError, actionError]);
        expect(errorHandler.caughtErrorsByErrorHandler).toEqual([]);
      })
    );
  });

  describe('toPromise', () => {
    it(
      'errors should be caught by ErrorHandler if there is no catch',
      freshPlatform(async () => {
        // Arrange
        const { injector } = await skipConsoleLogging(() =>
          platformBrowserDynamic().bootstrapModule(TestModule)
        );

        const store = injector.get(Store);
        const errorHandler = injector.get(CustomErrorHandler);

        // Act
        store.dispatch(new ProduceErrorSynchronously()).toPromise();
        await macrotask();
        // Assert
        expect(errorHandler.caughtErrorsByErrorHandler.length).toEqual(1);

        // Act
        store.dispatch(new ProduceErrorSynchronouslyInStream()).toPromise();
        await macrotask();
        // Assert
        expect(errorHandler.caughtErrorsByErrorHandler.length).toEqual(2);

        // Act
        store.dispatch(new ProduceErrorAsynchronously()).toPromise();
        await macrotask();
        // Assert
        expect(errorHandler.caughtErrorsByErrorHandler.length).toEqual(3);
        errorHandler.caughtErrorsByErrorHandler.forEach(error => {
          expect(error.message).toContain(
            'Uncaught (in promise): RangeError: Custom NGXS error'
          );
        });
      })
    );

    it(
      'errors should NOT be caught by ErrorHandler if there promise catch',
      freshPlatform(async () => {
        // Arrange
        const caughtErrors: any[] = [];
        const { injector } = await skipConsoleLogging(() =>
          platformBrowserDynamic().bootstrapModule(TestModule)
        );

        const store = injector.get(Store);
        const errorHandler = injector.get(CustomErrorHandler);

        // Act
        store
          .dispatch(new ProduceErrorSynchronously())
          .toPromise()
          .then(
            () => {},
            error => caughtErrors.push(error)
          );
        await macrotask();
        store
          .dispatch(new ProduceErrorSynchronouslyInStream())
          .toPromise()
          .then(
            () => {},
            error => caughtErrors.push(error)
          );
        await macrotask();
        store
          .dispatch(new ProduceErrorAsynchronously())
          .toPromise()
          .then(
            () => {},
            error => caughtErrors.push(error)
          );
        await macrotask();

        // Assert
        expect(caughtErrors.length).toEqual(3);
        expect(errorHandler.caughtErrorsByErrorHandler.length).toEqual(0);
        caughtErrors.forEach(error => {
          expect(error).toEqual(actionError);
        });
      })
    );
  });
});

function macrotask() {
  // We explicitly provide 10 ms to wait until RxJS `SafeSubscriber`
  // handles the error. The `SafeSubscriber` re-throws errors asynchronously,
  // it's the following: `setTimeout(() => { throw error })`.
  return new Promise(resolve => setTimeout(resolve, 10));
}

import { DoBootstrap, ErrorHandler, Injectable, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { freshPlatform, skipConsoleLogging } from '@ngxs/store/internals/testing';
import { Action, NgxsModule, State, Store } from '@ngxs/store';
import { defer, firstValueFrom, throwError } from 'rxjs';
import { tap } from 'rxjs/operators';

import { macrotask } from '../helpers/macrotask';

namespace ErrorActions {
  export class ProduceErrorSynchronously {
    static readonly type = 'Produce error synchronously';
  }

  export class ProduceErrorSynchronouslyInStream {
    static readonly type = 'Produce error synchronously in stream';
  }

  export class ProduceErrorAsynchronously {
    static readonly type = 'Produce error asynchronously';
  }
}

class SynchronousError {
  message = 'Synchronously Produced Error';
}

class SynchronousErrorInStream {
  message = 'Synchronously Produced Error In Stream';
}

class AsynchronousError {
  message = 'Asynchronously Produced Error';
}

describe('Error handling (https://github.com/ngxs/store/issues/1691)', () => {
  @State({
    name: 'app'
  })
  @Injectable()
  class AppState {
    @Action(ErrorActions.ProduceErrorSynchronously)
    produceErrorSynchronously() {
      throw new SynchronousError();
    }

    @Action(ErrorActions.ProduceErrorSynchronouslyInStream)
    produceErrorSynchronouslyInStream() {
      return throwError(() => new SynchronousErrorInStream());
    }

    @Action(ErrorActions.ProduceErrorAsynchronously)
    produceErrorAsynchronously() {
      return defer(() => Promise.resolve()).pipe(
        tap(() => {
          throw new AsynchronousError();
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
        store.dispatch(new ErrorActions.ProduceErrorSynchronously());
        await macrotask();
        // Assert
        expect(errorHandler.caughtErrorsByErrorHandler).toEqual([new SynchronousError()]);

        // Act
        store.dispatch(new ErrorActions.ProduceErrorSynchronouslyInStream());
        await macrotask();
        // Assert
        expect(errorHandler.caughtErrorsByErrorHandler).toEqual([
          new SynchronousError(),
          new SynchronousErrorInStream()
        ]);

        // Act
        store.dispatch(new ErrorActions.ProduceErrorAsynchronously());
        await macrotask();
        // Assert
        expect(errorHandler.caughtErrorsByErrorHandler).toEqual([
          new SynchronousError(),
          new SynchronousErrorInStream(),
          new AsynchronousError()
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
        store.dispatch(new ErrorActions.ProduceErrorSynchronously()).subscribe();
        await macrotask();
        // Assert
        expect(errorHandler.caughtErrorsByErrorHandler).toEqual([new SynchronousError()]);

        // Act
        store.dispatch(new ErrorActions.ProduceErrorSynchronouslyInStream()).subscribe();
        await macrotask();
        // Assert
        expect(errorHandler.caughtErrorsByErrorHandler).toEqual([
          new SynchronousError(),
          new SynchronousErrorInStream()
        ]);

        // Act
        store.dispatch(new ErrorActions.ProduceErrorAsynchronously()).subscribe();
        await macrotask();
        // Assert
        expect(errorHandler.caughtErrorsByErrorHandler).toEqual([
          new SynchronousError(),
          new SynchronousErrorInStream(),
          new AsynchronousError()
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
        store.dispatch(new ErrorActions.ProduceErrorSynchronously()).subscribe({
          error: error => caughtErrors.push(error)
        });
        await macrotask();
        // Assert
        expect(caughtErrors).toEqual([new SynchronousError()]);
        expect(errorHandler.caughtErrorsByErrorHandler).toEqual([]);

        // Act
        store.dispatch(new ErrorActions.ProduceErrorSynchronouslyInStream()).subscribe({
          error: error => caughtErrors.push(error)
        });
        await macrotask();
        // Assert
        expect(caughtErrors).toEqual([new SynchronousError(), new SynchronousErrorInStream()]);
        expect(errorHandler.caughtErrorsByErrorHandler).toEqual([]);

        // Act
        store.dispatch(new ErrorActions.ProduceErrorAsynchronously()).subscribe({
          error: error => caughtErrors.push(error)
        });
        await macrotask();
        // Assert
        expect(caughtErrors).toEqual([
          new SynchronousError(),
          new SynchronousErrorInStream(),
          new AsynchronousError()
        ]);
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
        firstValueFrom(store.dispatch(new ErrorActions.ProduceErrorSynchronously()));
        await macrotask();
        // Assert
        expect(errorHandler.caughtErrorsByErrorHandler.length).toEqual(1);

        // Act
        firstValueFrom(store.dispatch(new ErrorActions.ProduceErrorSynchronouslyInStream()));
        await macrotask();
        // Assert
        expect(errorHandler.caughtErrorsByErrorHandler.length).toEqual(2);

        // Act
        firstValueFrom(store.dispatch(new ErrorActions.ProduceErrorAsynchronously()));
        await macrotask();
        // Assert
        expect(errorHandler.caughtErrorsByErrorHandler.length).toEqual(3);

        const messages = errorHandler.caughtErrorsByErrorHandler.map(e => e.message);
        expect(messages[0]).toContain('Uncaught (in promise): SynchronousError');
        expect(messages[1]).toContain('Uncaught (in promise): SynchronousErrorInStream');
        expect(messages[2]).toContain('Uncaught (in promise): AsynchronousError');
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
        firstValueFrom(store.dispatch(new ErrorActions.ProduceErrorSynchronously())).then(
          () => {},
          error => caughtErrors.push(error)
        );
        await macrotask();
        firstValueFrom(
          store.dispatch(new ErrorActions.ProduceErrorSynchronouslyInStream())
        ).then(
          () => {},
          error => caughtErrors.push(error)
        );
        await macrotask();
        firstValueFrom(store.dispatch(new ErrorActions.ProduceErrorAsynchronously())).then(
          () => {},
          error => caughtErrors.push(error)
        );
        await macrotask();

        // Assert
        expect(caughtErrors.length).toEqual(3);
        expect(errorHandler.caughtErrorsByErrorHandler.length).toEqual(0);

        expect(caughtErrors).toEqual([
          new SynchronousError(),
          new SynchronousErrorInStream(),
          new AsynchronousError()
        ]);
      })
    );
  });
});

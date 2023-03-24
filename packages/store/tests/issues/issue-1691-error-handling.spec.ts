import {
  DoBootstrap,
  ErrorHandler,
  Injectable,
  Injector,
  NgModule,
  Type
} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { freshPlatform, skipConsoleLogging } from '@ngxs/store/internals/testing';
import { Action, NgxsModule, State, StateContext, Store } from '@ngxs/store';
import { defer, throwError } from 'rxjs';
import { tap } from 'rxjs/operators';
import { TestBed } from '@angular/core/testing';

describe('Error handling (https://github.com/ngxs/store/issues/1691)', () => {
  class ProduceErrorSynchronously {
    static readonly type = 'Produce error synchronously';
    constructor(public errorMessage: string = 'SyncError') {}
  }

  class ProduceErrorSynchronouslyInStream {
    static readonly type = 'Produce error synchronously in stream';
    constructor(public errorMessage: string = 'StreamError') {}
  }

  class ProduceErrorAsynchronously {
    static readonly type = 'Produce error asynchronously';
    constructor(public errorMessage: string = 'AsyncError') {}
  }

  type BootTestFn = <M>(testModule: Type<M>) => Promise<{
    injector: Injector;
  }>;

  async function setupFixture(options: { boot?: BootTestFn } = {}) {
    const recorder: string[] = [];

    @State({
      name: 'app'
    })
    @Injectable()
    class AppState {
      @Action(ProduceErrorSynchronously)
      produceErrorSynchronously(
        _: StateContext<any>,
        { errorMessage }: ProduceErrorSynchronously
      ) {
        recorder.push(`Action[ProduceErrorSynchronously](${errorMessage})`);
        throw new Error(errorMessage);
      }

      @Action(ProduceErrorSynchronouslyInStream)
      produceErrorSynchronouslyInStream(
        _: StateContext<any>,
        { errorMessage }: ProduceErrorSynchronouslyInStream
      ) {
        recorder.push(`Action[ProduceErrorSynchronouslyInStream](${errorMessage})`);
        return throwError(new Error(errorMessage));
      }

      @Action(ProduceErrorAsynchronously)
      produceErrorAsynchronously(
        _: StateContext<any>,
        { errorMessage }: ProduceErrorAsynchronously
      ) {
        recorder.push(`Action[ProduceErrorAsynchronously](${errorMessage})`);
        return defer(() => Promise.resolve()).pipe(
          tap(() => {
            recorder.push(`throw async Error: ${errorMessage}`);
            throw new Error(errorMessage);
          })
        );
      }
    }

    @Injectable()
    class CustomAngularErrorHandler implements ErrorHandler {
      globalErrorsCaught: any[] = [];

      handleError(error: any): void {
        const message = (error.message as string) || '';
        const messageLineOne = message.split('\n')[0];
        recorder.push(`Global catch: ${messageLineOne}`);
        this.globalErrorsCaught.push(messageLineOne);
      }
    }

    @NgModule({
      imports: [BrowserModule, NgxsModule.forRoot([AppState])],
      providers: [
        CustomAngularErrorHandler,
        { provide: ErrorHandler, useExisting: CustomAngularErrorHandler }
      ]
    })
    class TestModule implements DoBootstrap {
      ngDoBootstrap(): void {
        // Do not do anything.
      }
    }

    function macrotask() {
      // We explicitly provide 10 ms to wait until RxJS `SafeSubscriber`
      // handles the error. The `SafeSubscriber` re-throws errors asynchronously,
      // it's the following: `setTimeout(() => { throw error })`.
      recorder.push('Waiting started...');
      return new Promise<void>(resolve =>
        setTimeout(() => {
          recorder.push('Waited 10ms');
          resolve();
        }, 10)
      );
    }

    const bootTestModule: BootTestFn =
      options.boot ||
      (async testModule => platformBrowserDynamic().bootstrapModule(testModule));

    const { injector } = await skipConsoleLogging(() => bootTestModule(TestModule));

    const store = injector.get(Store);
    const errorHandler = injector.get(CustomAngularErrorHandler);
    const globalErrorsCaught = errorHandler.globalErrorsCaught;

    const localErrorsCaught: any[] = [];
    const localCatch = (error: any) => {
      recorder.push(`Local catch: ${error.message}`);
      localErrorsCaught.push(error.message);
    };

    const getErrorCounts = () => ({
      localErrorCount: localErrorsCaught.length,
      globalErrorCount: globalErrorsCaught.length
    });

    const expectLocalErrorsOnly = (errorsThrown: number) => {
      expect(getErrorCounts()).toEqual({
        localErrorCount: errorsThrown,
        globalErrorCount: 0
      });
    };

    const expectGlobalErrorsOnly = (errorsThrown: number) => {
      expect(getErrorCounts()).toEqual({
        localErrorCount: 0,
        globalErrorCount: errorsThrown
      });
    };

    return {
      store,
      errorHandler,
      injector,
      recorder,
      macrotask,
      globalErrorsCaught,
      localCatch,
      localErrorsCaught,
      expectLocalErrorsOnly,
      expectGlobalErrorsOnly
    };
  }

  describe('(plain test)', () => {
    createTestCases({
      wrapperFn: fn => fn,
      async boot(testModule) {
        TestBed.configureTestingModule({
          imports: [testModule]
        });
        return {
          injector: TestBed.inject(Injector)
        };
      }
    });
  });

  describe('(fresh platform)', () => {
    createTestCases({ wrapperFn: freshPlatform });
  });

  function createTestCases(options: {
    wrapperFn: (
      fn: (done?: VoidFunction) => Promise<void>
    ) => (done?: VoidFunction) => Promise<void>;
    boot?: BootTestFn;
  }) {
    const wrapperFn = options.wrapperFn;
    const fixtureOptions = { boot: options.boot };

    describe('observables', () => {
      it(
        'errors should be caught by ErrorHandler if there is no subscribe',
        wrapperFn(async () => {
          // Arrange
          const { store, recorder, macrotask, expectGlobalErrorsOnly } = await setupFixture(
            fixtureOptions
          );

          // Act
          store.dispatch(new ProduceErrorSynchronously());
          await macrotask();
          // Assert
          expectGlobalErrorsOnly(1);

          // Act
          store.dispatch(new ProduceErrorSynchronouslyInStream());
          await macrotask();
          // Assert
          expectGlobalErrorsOnly(2);

          // Act
          store.dispatch(new ProduceErrorAsynchronously());
          await macrotask();
          // Assert
          expectGlobalErrorsOnly(3);
          expect(recorder).toMatchInlineSnapshot(`
            Array [
              "Action[ProduceErrorSynchronously](SyncError)",
              "Waiting started...",
              "Global catch: SyncError",
              "Waited 10ms",
              "Action[ProduceErrorSynchronouslyInStream](StreamError)",
              "Waiting started...",
              "Global catch: StreamError",
              "Waited 10ms",
              "Action[ProduceErrorAsynchronously](AsyncError)",
              "Waiting started...",
              "throw async Error: AsyncError",
              "Global catch: AsyncError",
              "Waited 10ms",
            ]
          `);
        })
      );

      it(
        'errors should be caught by ErrorHandler if subscribe is empty',
        wrapperFn(async () => {
          // Arrange
          const { store, recorder, macrotask, expectGlobalErrorsOnly } = await setupFixture(
            fixtureOptions
          );

          // Act
          store.dispatch(new ProduceErrorSynchronously()).subscribe();
          await macrotask();
          // Assert
          expectGlobalErrorsOnly(1);

          // Act
          store.dispatch(new ProduceErrorSynchronouslyInStream()).subscribe();
          await macrotask();
          // Assert
          expectGlobalErrorsOnly(2);

          // Act
          store.dispatch(new ProduceErrorAsynchronously()).subscribe();
          await macrotask();
          // Assert
          expectGlobalErrorsOnly(3);
          expect(recorder).toMatchInlineSnapshot(`
            Array [
              "Action[ProduceErrorSynchronously](SyncError)",
              "Waiting started...",
              "Global catch: SyncError",
              "Waited 10ms",
              "Action[ProduceErrorSynchronouslyInStream](StreamError)",
              "Waiting started...",
              "Global catch: StreamError",
              "Waited 10ms",
              "Action[ProduceErrorAsynchronously](AsyncError)",
              "Waiting started...",
              "throw async Error: AsyncError",
              "Global catch: AsyncError",
              "Waited 10ms",
            ]
          `);
        })
      );

      it(
        'errors should be caught by ErrorHandler if subscribes to next only',
        wrapperFn(async () => {
          // Arrange
          const { store, recorder, macrotask, expectGlobalErrorsOnly } = await setupFixture(
            fixtureOptions
          );

          // Act
          store.dispatch(new ProduceErrorSynchronously()).subscribe(() => {});
          await macrotask();
          // Assert
          expectGlobalErrorsOnly(1);

          // Act
          store.dispatch(new ProduceErrorSynchronouslyInStream()).subscribe(() => {});
          await macrotask();
          // Assert
          expectGlobalErrorsOnly(2);

          // Act
          store.dispatch(new ProduceErrorAsynchronously()).subscribe(() => {});
          await macrotask();
          // Assert
          expectGlobalErrorsOnly(3);
          expect(recorder).toMatchInlineSnapshot(`
            Array [
              "Action[ProduceErrorSynchronously](SyncError)",
              "Waiting started...",
              "Global catch: SyncError",
              "Waited 10ms",
              "Action[ProduceErrorSynchronouslyInStream](StreamError)",
              "Waiting started...",
              "Global catch: StreamError",
              "Waited 10ms",
              "Action[ProduceErrorAsynchronously](AsyncError)",
              "Waiting started...",
              "throw async Error: AsyncError",
              "Global catch: AsyncError",
              "Waited 10ms",
            ]
          `);
        })
      );

      it(
        'errors should NOT be caught by ErrorHandler if subscribe has error observer',
        wrapperFn(async () => {
          // Arrange

          const { store, recorder, macrotask, localCatch, expectLocalErrorsOnly } =
            await setupFixture(fixtureOptions);

          // Act
          store.dispatch(new ProduceErrorSynchronously()).subscribe({
            error: localCatch
          });
          await macrotask();
          // Assert
          expectLocalErrorsOnly(1);

          // Act
          store.dispatch(new ProduceErrorSynchronouslyInStream()).subscribe({
            error: localCatch
          });
          await macrotask();
          // Assert
          expectLocalErrorsOnly(2);

          // Act
          store.dispatch(new ProduceErrorAsynchronously()).subscribe({
            error: localCatch
          });
          await macrotask();
          // Assert
          expectLocalErrorsOnly(3);
          expect(recorder).toMatchInlineSnapshot(`
            Array [
              "Action[ProduceErrorSynchronously](SyncError)",
              "Local catch: SyncError",
              "Waiting started...",
              "Waited 10ms",
              "Action[ProduceErrorSynchronouslyInStream](StreamError)",
              "Local catch: StreamError",
              "Waiting started...",
              "Waited 10ms",
              "Action[ProduceErrorAsynchronously](AsyncError)",
              "Waiting started...",
              "throw async Error: AsyncError",
              "Local catch: AsyncError",
              "Waited 10ms",
            ]
          `);
        })
      );
    });

    describe('toPromise', () => {
      it(
        'errors should be caught by ErrorHandler if there is no catch',
        wrapperFn(async () => {
          // Arrange
          const { store, recorder, macrotask, expectGlobalErrorsOnly } = await setupFixture(
            fixtureOptions
          );

          // Act
          store.dispatch(new ProduceErrorSynchronously()).toPromise();
          await macrotask();
          // Assert
          expectGlobalErrorsOnly(1);

          // Act
          store.dispatch(new ProduceErrorSynchronouslyInStream()).toPromise();
          await macrotask();
          // Assert
          expectGlobalErrorsOnly(2);

          // Act
          store.dispatch(new ProduceErrorAsynchronously()).toPromise();
          await macrotask();
          // Assert
          expectGlobalErrorsOnly(3);
          expect(recorder).toMatchInlineSnapshot(`
            Array [
              "Action[ProduceErrorSynchronously](SyncError)",
              "Waiting started...",
              "Global catch: Uncaught (in promise): Error: SyncError",
              "Waited 10ms",
              "Action[ProduceErrorSynchronouslyInStream](StreamError)",
              "Waiting started...",
              "Global catch: Uncaught (in promise): Error: StreamError",
              "Waited 10ms",
              "Action[ProduceErrorAsynchronously](AsyncError)",
              "Waiting started...",
              "throw async Error: AsyncError",
              "Global catch: Uncaught (in promise): Error: AsyncError",
              "Waited 10ms",
            ]
          `);
        })
      );

      it(
        'errors should NOT be caught by ErrorHandler if there promise catch',
        wrapperFn(async () => {
          // Arrange
          const { store, recorder, macrotask, localCatch, expectLocalErrorsOnly } =
            await setupFixture(fixtureOptions);

          // Act
          store
            .dispatch(new ProduceErrorSynchronously())
            .toPromise()
            .then(() => {}, localCatch);
          await macrotask();
          expectLocalErrorsOnly(1);
          store
            .dispatch(new ProduceErrorSynchronouslyInStream())
            .toPromise()
            .then(() => {}, localCatch);
          await macrotask();
          expectLocalErrorsOnly(2);
          store
            .dispatch(new ProduceErrorAsynchronously())
            .toPromise()
            .then(() => {}, localCatch);
          await macrotask();

          // Assert
          expectLocalErrorsOnly(3);
          expect(recorder).toMatchInlineSnapshot(`
            Array [
              "Action[ProduceErrorSynchronously](SyncError)",
              "Waiting started...",
              "Local catch: SyncError",
              "Waited 10ms",
              "Action[ProduceErrorSynchronouslyInStream](StreamError)",
              "Waiting started...",
              "Local catch: StreamError",
              "Waited 10ms",
              "Action[ProduceErrorAsynchronously](AsyncError)",
              "Waiting started...",
              "throw async Error: AsyncError",
              "Local catch: AsyncError",
              "Waited 10ms",
            ]
          `);
        })
      );

      it(
        'errors should NOT be caught by ErrorHandler if there is an await try catch',
        wrapperFn(async () => {
          // Arrange
          const { store, recorder, macrotask, localCatch, expectLocalErrorsOnly } =
            await setupFixture(fixtureOptions);

          // Act
          try {
            await store.dispatch(new ProduceErrorSynchronously()).toPromise();
          } catch (error: any) {
            localCatch(error);
          }
          await macrotask();
          try {
            await store.dispatch(new ProduceErrorSynchronouslyInStream()).toPromise();
          } catch (error: any) {
            localCatch(error);
          }
          await macrotask();

          try {
            await store.dispatch(new ProduceErrorAsynchronously()).toPromise();
          } catch (error: any) {
            localCatch(error);
          }
          await macrotask();

          // Assert
          expectLocalErrorsOnly(3);
          expect(recorder).toMatchInlineSnapshot(`
            Array [
              "Action[ProduceErrorSynchronously](SyncError)",
              "Local catch: SyncError",
              "Waiting started...",
              "Waited 10ms",
              "Action[ProduceErrorSynchronouslyInStream](StreamError)",
              "Local catch: StreamError",
              "Waiting started...",
              "Waited 10ms",
              "Action[ProduceErrorAsynchronously](AsyncError)",
              "throw async Error: AsyncError",
              "Local catch: AsyncError",
              "Waiting started...",
              "Waited 10ms",
            ]
          `);
        })
      );
    });
  }
});

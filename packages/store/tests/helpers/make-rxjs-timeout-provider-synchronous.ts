import { timeoutProvider } from 'rxjs/internal/scheduler/timeoutProvider';

export function makeRxJSTimeoutProviderSynchronous(): void {
  beforeAll(() => {
    // RxJS would report unhandled errors asynchronusly by default,
    // let's report them synchronously in unit tests.
    timeoutProvider.delegate = {
      setTimeout: handler => {
        handler();
        return 0;
      },
      clearTimeout: () => {}
    };
  });

  afterAll(() => {
    timeoutProvider.delegate = undefined;
  });
}

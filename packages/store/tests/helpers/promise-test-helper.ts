export function createPromiseTestHelper<T = void>() {
  type MarkResolvedFn = (result: T | PromiseLike<T>) => void;
  type MarkRejectedFn = (reason?: any) => void;
  let resolveFn: MarkResolvedFn = () => {};
  let rejectFn: MarkRejectedFn = () => {};

  const promise = new Promise<T>((resolve, reject) => {
    resolveFn = resolve;
    rejectFn = reject;
  });
  return {
    promise,
    markPromiseResolved(...args: Parameters<MarkResolvedFn>) {
      resolveFn(...args);
      resolveFn = () => {};
    },
    markPromiseRejected(reason?: any) {
      rejectFn(reason);
      rejectFn = () => {};
    }
  };
}

export function macrotask() {
  // We explicitly provide 5 ms to wait until RxJS `SafeSubscriber`
  // handles the error. The `SafeSubscriber` re-throws errors asynchronously,
  // it's the following: `setTimeout(() => { throw error })`.
  return new Promise(resolve => setTimeout(resolve, 5));
}

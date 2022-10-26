/// <reference types="jest" />

export function skipConsoleLogging<T extends (...args: any[]) => any>(fn: T): ReturnType<T> {
  const consoleSpies = [
    jest.spyOn(console, 'log').mockImplementation(() => {}),
    jest.spyOn(console, 'warn').mockImplementation(() => {}),
    jest.spyOn(console, 'error').mockImplementation(() => {}),
    jest.spyOn(console, 'info').mockImplementation(() => {})
  ];
  function restoreSpies() {
    consoleSpies.forEach(spy => spy.mockRestore());
  }
  let restoreSpyAsync = false;
  try {
    const returnValue = fn();
    if (returnValue instanceof Promise) {
      restoreSpyAsync = true;
      return returnValue.finally(() => restoreSpies()) as ReturnType<T>;
    }
    return returnValue;
  } finally {
    if (!restoreSpyAsync) {
      restoreSpies();
    }
  }
}

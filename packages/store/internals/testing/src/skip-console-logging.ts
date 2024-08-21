export type ConsoleRecord = [string, any[]];
export type ConsoleRecorder = ConsoleRecord[];

export function loggedError(message: string): ConsoleRecord {
  return ['error', [expect.objectContaining({ message })]];
}

export function skipConsoleLogging<T extends (...args: any[]) => any>(
  fn: T,
  consoleRecorder: ConsoleRecorder = []
): ReturnType<T> {
  const consoleSpies = [
    jest.spyOn(console, 'log').mockImplementation((...args) => {
      consoleRecorder.push(['log', args]);
    }),
    jest.spyOn(console, 'warn').mockImplementation((...args) => {
      consoleRecorder.push(['warn', args]);
    }),
    jest.spyOn(console, 'error').mockImplementation((...args) => {
      consoleRecorder.push(['error', args]);
    }),
    jest.spyOn(console, 'info').mockImplementation((...args) => {
      consoleRecorder.push(['info', args]);
    })
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

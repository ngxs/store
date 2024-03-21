import { config } from 'rxjs';

export const UnhandledErrorContextSymbol = Symbol('NGXS_UnhandledErrorContext');

export interface UnhandledErrorContext {
  action: any;
  handle: VoidFunction;
}

config.onUnhandledError = (error: any) => {
  const unhandledErrorContext: UnhandledErrorContext = error?.[UnhandledErrorContextSymbol];
  if (unhandledErrorContext) {
    unhandledErrorContext.handle();
  } else {
    throw error;
  }
};

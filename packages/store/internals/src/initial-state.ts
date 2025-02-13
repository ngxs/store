import { InjectionToken } from '@angular/core';

import { ɵPlainObject } from './symbols';

declare const ngDevMode: boolean;

export class ɵInitialState {
  private static _value: ɵPlainObject = {};

  static set(state: ɵPlainObject) {
    this._value = state;
  }

  static pop(): ɵPlainObject {
    const state = this._value;
    this._value = {};
    return state;
  }
}

export const ɵINITIAL_STATE_TOKEN = new InjectionToken<ɵPlainObject>(
  typeof ngDevMode !== 'undefined' && ngDevMode ? 'INITIAL_STATE_TOKEN' : '',
  {
    providedIn: 'root',
    factory: () => ɵInitialState.pop()
  }
);

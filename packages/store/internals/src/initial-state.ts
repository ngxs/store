import { InjectionToken } from '@angular/core';
import { PlainObject } from './symbols';

export class InitialState {
  private static _value: PlainObject = {};

  static set(state: PlainObject) {
    this._value = state;
  }

  static pop(): PlainObject {
    const state = this._value;
    this._value = {};
    return state;
  }
}

export const INITIAL_STATE_TOKEN = new InjectionToken<any>('INITIAL_STATE_TOKEN', {
  providedIn: 'root',
  factory: () => InitialState.pop()
});

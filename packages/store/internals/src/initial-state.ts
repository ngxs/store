import { InjectionToken } from '@angular/core';
import { PlainObject } from './symbols';

export const INITIAL_STATE_TOKEN = new InjectionToken<any>('INITIAL_STATE_TOKEN');

export class InitialState {
  private static value: PlainObject = {};

  public static set(state: PlainObject) {
    this.value = state;
  }

  public static pop(): PlainObject {
    const state: PlainObject = this.value;
    this.value = {};
    return state;
  }
}

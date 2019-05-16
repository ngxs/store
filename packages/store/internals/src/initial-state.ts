import { InjectionToken } from '@angular/core';
import { ObjectKeyMap } from './symbols';

export const INITIAL_STATE_TOKEN = new InjectionToken<any>('INITIAL_STATE_TOKEN');

export class InitialState {
  private static value: ObjectKeyMap<any> = {};

  public static set(state: ObjectKeyMap<any>) {
    this.value = state;
  }

  public static pop() {
    const state: ObjectKeyMap<any> = this.value;
    this.value = {};
    return state;
  }
}

import { InjectionToken } from '@angular/core';

export const INITIAL_STATE_TOKEN = new InjectionToken<any>('INITIAL_STATE_TOKEN');

export class InitialState {
  private static value = {};

  public static set(state: any) {
    this.value = state;
  }

  public static pop() {
    const state = this.value;
    this.value = {};
    return state;
  }
}

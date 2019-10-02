import { NgxsDevtoolsAction, NgxsDevtoolsOptions } from '@ngxs/devtools-plugin';
import { Subject, Subscription } from 'rxjs';
import { InitState } from '@ngxs/store';

import { DevtoolsCallStack, MockState } from './symbols';

export class ReduxDevtoolsMockConnector {
  public options: NgxsDevtoolsOptions;
  public devtoolsStack: DevtoolsCallStack[] = [];
  public initialState: MockState = null!;
  private dispatcher: Subject<NgxsDevtoolsAction> = new Subject<NgxsDevtoolsAction>();
  private countId = 0;

  public subscribe(fn: Function): Subscription {
    return this.dispatcher.subscribe(e => fn(e));
  }

  public init(state: MockState): void {
    this.initialState = JSON.parse(JSON.stringify(state));
    this.devtoolsStack.push({
      id: this.countId,
      type: InitState.type,
      payload: undefined,
      state: undefined!,
      newState: state,
      jumped: false
    });
  }

  public send(action: any, newState?: any): void {
    this.countId++;

    const prevState: MockState =
      this.devtoolsStack.length > 0
        ? this.devtoolsStack[this.devtoolsStack.length - 1].newState
        : this.initialState;

    this.devtoolsStack.push({
      id: this.countId,
      type: action.type,
      payload: action.payload,
      state: prevState,
      newState: newState,
      jumped: false
    });
  }

  public jumpToActionById(id: number): void {
    if (!id) {
      return; // can't jump to @INIT
    }

    for (let i = this.devtoolsStack.length - 1, marked = false; i >= 0; i--) {
      const pointer: DevtoolsCallStack = this.devtoolsStack[i];

      if (pointer.id === id) {
        marked = true;

        this.dispatcher.next({
          id: pointer.id,
          type: 'DISPATCH',
          payload: { type: 'JUMP_TO_ACTION' },
          state: JSON.stringify(pointer.newState),
          source: null!
        });
      }

      pointer.jumped = !marked;
    }
  }
}

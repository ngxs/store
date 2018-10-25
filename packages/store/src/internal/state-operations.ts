import { Injectable, Injector } from '@angular/core';
import { StateOperations } from '../internal/internals';
import { InternalDispatcher } from '../internal/dispatcher';
import { StateStream } from './state-stream';
import { NgxsConfig } from '../symbols';
import { deepFreeze } from '../utils/freeze';

/**
 * State Context factory class
 * @ignore
 */
@Injectable()
export class InternalStateOperations {
  private stateStream: StateStream;
  private dispatcher: InternalDispatcher;
  private readonly developmentMode: boolean;

  constructor(context: Injector) {
    this.stateStream = context.get(StateStream);
    this.dispatcher = context.get(InternalDispatcher);
    this.developmentMode = context.get(NgxsConfig).developmentMode;
    InternalStateOperations.checkDevelopmentMode(this.developmentMode);
  }

  private static checkDevelopmentMode(developmentMode: boolean) {
    if (developmentMode) {
      console.warn(
        'NGXS is running in the development mode.\n',
        'Choose developmentMode to enable the production mode.\n',
        'NgxsModule.forRoot(states, { developmentMode: !environment.production })'
      );
    }
  }

  /**
   * Returns the root state operators.
   */
  public getRootStateOperations<T = any, U = any>(): StateOperations<T> {
    return {
      getState: (): T => this.stateStream.getValue(),
      setState: (newState: T) => this.stateStream.next(this.ensureState<T>(newState)),
      dispatch: (actions: U[]) => this.dispatcher.dispatch(actions)
    };
  }

  private ensureState<T = any>(state: T): T {
    return this.developmentMode ? deepFreeze(state) : state;
  }
}

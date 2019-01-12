import { NgxsBootstrapper, StateContext, StateStream } from '@ngxs/store';
import { NgModuleRef } from '@angular/core';
import { Subscription } from 'rxjs';

import { getStateContext } from './state-context';
import { CallStackFrame, NgxsHmrLifeCycle } from '../symbols';
import { getBootstrap, getStateFromHmrStorage, getStateStream } from './common';

export function stateEventLoop<T extends NgxsHmrLifeCycle<S>, S>(
  ref: NgModuleRef<T>,
  frame: CallStackFrame<S>
) {
  const stateContext: StateContext<S> | undefined = getStateContext<T, S>(ref);
  if (stateContext) {
    const previousState: Partial<S> = getStateFromHmrStorage<S>();
    const existSavedState: boolean = Object.keys(previousState).length > 0;

    // get event subscriptions
    const stateStream: StateStream | null = getStateStream<T>(ref);
    const bootstrap: NgxsBootstrapper | null = getBootstrap(ref);
    const canBeUpdateState: boolean = Boolean(existSavedState && stateStream && bootstrap);

    if (canBeUpdateState) {
      let eventId: number;
      const waitTime = 100;

      bootstrap!.appBootstrapped$.subscribe(() => {
        const stateStreamSub: Subscription = stateStream!.subscribe(() => {
          // setTimeout used for zone detection after set hmr state
          clearInterval(eventId);
          // only need to get the last message
          eventId = window.setTimeout(() => {
            // close check on the message queue
            stateStreamSub.unsubscribe();
            // if events are no longer running on the call stack,
            // then we can update the state
            frame(previousState, stateContext);
          }, waitTime);
        });
      });
    }
  }
}

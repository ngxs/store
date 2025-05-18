import { inject, Injectable } from '@angular/core';
import { ɵNgxsActionRegistry, type ɵStateClass } from '@ngxs/store/internals';

import type { ActionType } from './symbols';
import type { StateContext } from '../symbols';
import { StateFactory } from '../internal/state-factory';
import { InternalActionHandlerFactory } from '../internal/action-handler-factory';

export interface QueuedAction {
  StateClass: ɵStateClass;
  Action: ActionType;
  handlerFn: (ctx: StateContext<any>, action: any) => any;
}

/** @internal */
@Injectable({ providedIn: 'root' })
export class QueuedActions extends Set<QueuedAction> {
  flushActions(): void {
    const stateFactory = inject(StateFactory);
    const registry = inject(ɵNgxsActionRegistry);
    const actionHandlerFactory = inject(InternalActionHandlerFactory);

    const queueActions = [...this.values()];

    for (const queuedAction of queueActions) {
      const path = stateFactory.resolveStatePath(queuedAction.StateClass);
      if (typeof ngDevMode !== 'undefined' && ngDevMode && !path) {
        throw new Error('State is not registered yet to define action on.');
      }
      const actionHandler = actionHandlerFactory.createActionHandler(
        path!,
        queuedAction.handlerFn,
        true
      );
      registry.register(queuedAction.Action.type, actionHandler);
      this.delete(queuedAction);
    }
  }
}

import { inject } from '@angular/core';
import { ɵNgxsActionRegistry, ɵStateClass } from '@ngxs/store/internals';

import { ActionType } from './symbols';
import { StateContext } from '../symbols';
import { StateFactory } from '../internal/state-factory';
import { InternalActionHandlerFactory } from '../internal/action-handler-factory';

/**
 *
 */
export function experimentalBuildActionHandler(
  StateClass: ɵStateClass,
  Action: ActionType,
  handlerFn: (ctx: StateContext<any>, action: any) => any
) {
  return {
    attach: () => {
      const stateFactory = inject(StateFactory);
      const registry = inject(ɵNgxsActionRegistry);
      const actionHandlerFactory = inject(InternalActionHandlerFactory);
      const path = stateFactory.resolveStatePath(StateClass);
      if (typeof ngDevMode !== 'undefined' && ngDevMode && !path) {
        throw new Error('State is not registered yet to define action on.');
      }
      const actionHandler = actionHandlerFactory.createActionHandler(path!, handlerFn, true);
      return registry.register(Action.type, actionHandler);
    }
  };
}

import { inject, Injectable } from '@angular/core';
import {
  type StateToken,
  type ɵActionOptions,
  ɵNgxsActionRegistry
} from '@ngxs/store/internals';
import type { Observable } from 'rxjs';

import type { ActionDef } from './symbols';
import type { StateContext } from '../symbols';
import { InternalActionHandlerFactory } from '../internal/action-handler-factory';

@Injectable({ providedIn: 'root' })
export class ActionDirector {
  private _registry = inject(ɵNgxsActionRegistry);
  private _actionHandlerFactory = inject(InternalActionHandlerFactory);

  attachAction<TStateModel, TActionType extends ActionDef>(
    stateToken: StateToken<TStateModel>,
    Action: TActionType,
    handlerFn: (
      ctx: StateContext<TStateModel>,
      action: InstanceType<TActionType>
    ) => void | Observable<unknown> | Promise<unknown>,
    options: ɵActionOptions = {}
  ) {
    const actionHandler = this._actionHandlerFactory.createActionHandler(
      stateToken.getName(),
      handlerFn,
      options
    );
    const detach = this._registry.register(Action.type, actionHandler);
    return { detach };
  }
}

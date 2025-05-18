import { inject } from '@angular/core';
import { ɵStateClass } from '@ngxs/store/internals';
import type { Observable } from 'rxjs';

import { ActionDef } from './symbols';
import { StateContext } from '../symbols';
import { QueuedActions } from './queued-actions';

export class ActionHandler<TActionType extends ActionDef> {
  constructor(
    private _StateClass: ɵStateClass,
    private _Action: TActionType,
    private _handlerFn: (
      ctx: StateContext<any>,
      action: InstanceType<TActionType>
    ) => void | Observable<void> | Promise<void>
  ) {}

  attach() {
    const queue = inject(QueuedActions);

    queue.add({
      StateClass: this._StateClass,
      Action: this._Action,
      handlerFn: this._handlerFn
    });
  }
}

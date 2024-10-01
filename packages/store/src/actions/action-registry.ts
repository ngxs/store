import { Injectable, OnDestroy } from '@angular/core';
import { ɵActionHandlerMetaData } from '@ngxs/store/internals';

interface InvokableActionHandlerMetaData extends ɵActionHandlerMetaData {
  path: string;
  instance: any;
}

@Injectable({ providedIn: 'root' })
export class NgxsActionRegistry implements OnDestroy {
  // Instead of going over the states list every time an action is dispatched,
  // we are constructing a map of action types to lists of action metadata.
  // If the `@@Init` action is handled in two different states, the action
  // metadata list will contain two objects that have the state `instance` and
  // method names to be used as action handlers (decorated with `@Action(InitState)`).
  private readonly _actionTypeToHandlersMap = new Map<
    string,
    Set<InvokableActionHandlerMetaData>
  >();

  get(type: string) {
    return this._actionTypeToHandlersMap.get(type);
  }

  register(type: string, handler: InvokableActionHandlerMetaData) {
    const handlers = this._actionTypeToHandlersMap.get(type) ?? new Set();
    handlers.add(handler);
    this._actionTypeToHandlersMap.set(type, handlers);

    return () => {
      const handlers = this._actionTypeToHandlersMap.get(type)!;
      handlers.delete(handler);
      this._actionTypeToHandlersMap.set(type, handlers);
    };
  }

  ngOnDestroy(): void {
    this._actionTypeToHandlersMap.clear();
  }
}

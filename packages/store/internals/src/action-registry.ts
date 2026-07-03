import { DestroyRef, inject, Injectable } from '@angular/core';
import type { Observable } from 'rxjs';

import { ɵNGXS_DEVELOPMENT_OPTIONS } from './dev-features';

export type ActionHandlerFn = (action: any) => Observable<unknown>;

@Injectable({ providedIn: 'root' })
export class ɵNgxsActionRegistry {
  // Instead of going over the states list every time an action is dispatched,
  // we are constructing a map of action types to lists of action metadata.
  // If the `@@Init` action is handled in two different states, the action
  // metadata list will contain two objects that have the state `instance` and
  // method names to be used as action handlers (decorated with `@Action(InitState)`).
  private readonly _actionTypeToHandlersMap = new Map<string, Set<ActionHandlerFn>>();
  // Tracks which action class first claimed a given `type` string, so we can warn
  // when two unrelated action classes are declared with the same type.
  // Only allocated when `warnOnDuplicateActionTypes` is enabled.
  private readonly _actionTypeToClass?: Map<string, unknown>;

  constructor() {
    if (typeof ngDevMode !== 'undefined' && ngDevMode) {
      const warnOnDuplicateActionTypes = inject(ɵNGXS_DEVELOPMENT_OPTIONS, {
        optional: true
      })?.warnOnDuplicateActionTypes;

      if (warnOnDuplicateActionTypes) {
        this._actionTypeToClass = new Map<string, unknown>();
      }
    }

    inject(DestroyRef).onDestroy(() => {
      this._actionTypeToHandlersMap.clear();
      if (typeof ngDevMode !== 'undefined' && ngDevMode) {
        this._actionTypeToClass?.clear();
      }
    });
  }

  get(type: string) {
    return this._actionTypeToHandlersMap.get(type);
  }

  register(type: string, handler: ActionHandlerFn, actionClass?: unknown) {
    // Only track actual action classes, not the `{ type: string }` shorthand — a fresh
    // object literal is intentionally passed on every `@Action({ type: '...' })` usage,
    // even when multiple handlers legitimately share the same type.
    if (
      typeof ngDevMode !== 'undefined' &&
      ngDevMode &&
      this._actionTypeToClass &&
      typeof actionClass === 'function'
    ) {
      const existingActionClass = this._actionTypeToClass.get(type);
      if (existingActionClass && existingActionClass !== actionClass) {
        console.error(
          `Multiple action classes are using the same type "${type}". Every handler registered ` +
            `for this type will run whenever either action is dispatched, even though their payloads ` +
            `may differ. Action types must be unique.`
        );
      } else {
        this._actionTypeToClass.set(type, actionClass);
      }
    }

    const handlers = this._actionTypeToHandlersMap.get(type) ?? new Set();
    handlers.add(handler);
    this._actionTypeToHandlersMap.set(type, handlers);

    return () => {
      const handlers = this._actionTypeToHandlersMap.get(type)!;
      handlers.delete(handler);
    };
  }
}

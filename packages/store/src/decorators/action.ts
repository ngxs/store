import { ɵActionOptions, ɵensureStoreMetadata, ɵhasOwnProperty } from '@ngxs/store/internals';

import { ActionDef, ActionType } from '../actions/symbols';
import { throwActionDecoratorError } from '../configs/messages.config';
import { StateContext } from '../symbols';

/**
 * Given an action class, returns its payload.
 */
type ActionToPayload<Action extends ActionType> =
  Action extends ActionDef<any, infer ActionPayload> ? ActionPayload : never;

/**
 * Given a list of action classes, returns the union of their payloads.
 */
type ActionsToPayload<Actions extends readonly ActionType[]> = {
  [K in keyof Actions]: ActionToPayload<Actions[K]>;
}[number];

/**
 * Given an action class or a list of action classes, returns the union of their payloads.
 */
type ActionOrActionsToPayload<ActionOrActions> = ActionOrActions extends ActionType
  ? ActionToPayload<ActionOrActions>
  : ActionOrActions extends ActionType[]
    ? ActionsToPayload<ActionOrActions>
    : never;

/**
 * Describes what methods can be decorated with an `@Action` decorator that has been passed the given action(s).
 */
type HandlerTypedPropertyDescriptor<ActionOrActions> =
  | TypedPropertyDescriptor<() => any>
  | TypedPropertyDescriptor<(stateContext: StateContext<any>) => any>
  | TypedPropertyDescriptor<
      (
        stateContext: StateContext<any>,
        action: ActionOrActionsToPayload<ActionOrActions>
      ) => any
    >;

/**
 * The result of a call to the `@Action()` decorator with the given action(s) as its first argument.
 */
type ActionDecorator<ActionOrActions extends ActionType | ActionType[]> = (
  target: any,
  name: string | symbol,
  _descriptor: HandlerTypedPropertyDescriptor<ActionOrActions>
) => void;

/**
 * Decorates a method with action information.
 */
export function Action<ActionOrActions extends ActionType | ActionType[]>(
  actions: ActionOrActions,
  options?: ɵActionOptions
): ActionDecorator<ActionOrActions> {
  return (
    target: any,
    name: string | symbol,
    // This parameter ensures that the decorated method has a call signature that could be passed an instance of the given action(s).
    _descriptor: HandlerTypedPropertyDescriptor<ActionOrActions>
  ): void => {
    if (typeof ngDevMode !== 'undefined' && ngDevMode) {
      const isStaticMethod = ɵhasOwnProperty(target, 'prototype');

      if (isStaticMethod) {
        throwActionDecoratorError();
      }
    }

    const meta = ɵensureStoreMetadata(target.constructor);

    const actionArray = Array.isArray(actions) ? actions : [actions];

    for (const action of actionArray) {
      const type = action.type;

      if (!meta.actions[type]) {
        meta.actions[type] = [];
      }

      meta.actions[type].push({
        fn: name,
        options: options || {},
        type
      });
    }
  };
}

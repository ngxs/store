import { OperatorFunction, Observable } from 'rxjs';
import { map, filter } from 'rxjs/operators';

import { ActionType } from '../actions/symbols';
import { getActionTypeFromInstance } from '../utils/utils';
import { ActionContext, ActionStatus } from '../actions-stream';

type TupleKeys<T extends any[]> = Exclude<keyof T, keyof []>;

/**
 * Given a POJO, returns the POJO type, given a class constructor object, returns the type of the class.
 *
 * This utility type exists due to the complexity of ActionType being either an ActionDef class or the plain
 * `{ type: string }` type (or similar compatible POJO types).
 */
type Constructed<T> = T extends new (...args: any[]) => infer U ? U : T;

export interface ActionCompletion<T = any, E = Error> {
  action: T;
  result: {
    successful: boolean;
    canceled: boolean;
    error?: E;
  };
}

/**
 * RxJS operator for selecting out specific actions.
 *
 * This will grab actions that have just been dispatched as well as actions that have completed
 */
export function ofAction<T extends ActionType[]>(
  ...allowedTypes: T
): OperatorFunction<
  ActionContext<Constructed<T[TupleKeys<T>]>>,
  Constructed<T[TupleKeys<T>]>
> {
  return ofActionOperator(allowedTypes);
}

/**
 * RxJS operator for selecting out specific actions.
 *
 * This will ONLY grab actions that have just been dispatched
 */
export function ofActionDispatched<T extends ActionType[]>(
  ...allowedTypes: T
): OperatorFunction<
  ActionContext<Constructed<T[TupleKeys<T>]>>,
  Constructed<T[TupleKeys<T>]>
> {
  return ofActionOperator(allowedTypes, [ActionStatus.Dispatched]);
}

/**
 * RxJS operator for selecting out specific actions.
 *
 * This will ONLY grab actions that have just been successfully completed
 */
export function ofActionSuccessful<T extends ActionType[]>(
  ...allowedTypes: T
): OperatorFunction<
  ActionContext<Constructed<T[TupleKeys<T>]>>,
  Constructed<T[TupleKeys<T>]>
> {
  return ofActionOperator(allowedTypes, [ActionStatus.Successful]);
}

/**
 * RxJS operator for selecting out specific actions.
 *
 * This will ONLY grab actions that have just been canceled
 */
export function ofActionCanceled<T extends ActionType[]>(
  ...allowedTypes: T
): OperatorFunction<
  ActionContext<Constructed<T[TupleKeys<T>]>>,
  Constructed<T[TupleKeys<T>]>
> {
  return ofActionOperator(allowedTypes, [ActionStatus.Canceled]);
}

/**
 * RxJS operator for selecting out specific actions.
 *
 * This will ONLY grab actions that have just been completed
 */
export function ofActionCompleted<T extends ActionType[]>(
  ...allowedTypes: T
): OperatorFunction<
  ActionContext<Constructed<T[TupleKeys<T>]>>,
  ActionCompletion<Constructed<T[TupleKeys<T>]>>
> {
  const allowedStatuses = [
    ActionStatus.Successful,
    ActionStatus.Canceled,
    ActionStatus.Errored
  ];
  return ofActionOperator(allowedTypes, allowedStatuses, mapActionResult);
}

/**
 * RxJS operator for selecting out specific actions.
 *
 * This will ONLY grab actions that have just thrown an error
 */
export function ofActionErrored<T extends ActionType[]>(
  ...allowedTypes: T
): OperatorFunction<
  ActionContext<Constructed<T[TupleKeys<T>]>>,
  Constructed<T[TupleKeys<T>]>
> {
  return ofActionOperator(allowedTypes, [ActionStatus.Errored]);
}

function ofActionOperator(
  allowedTypes: ActionType[],
  statuses?: ActionStatus[],
  // This actually could've been `OperatorFunction<ActionContext, ActionCompletion | any>`,
  // since it maps either to `ctx.action` OR to `ActionCompletion`. But `ActionCompleteion | any`
  // defaults to `any`, thus there is no sense from union type.
  mapOperator: () => OperatorFunction<ActionContext, any> = mapAction
): OperatorFunction<ActionContext, any> {
  const allowedMap = createAllowedActionTypesMap(allowedTypes);
  const allowedStatusMap = statuses && createAllowedStatusesMap(statuses);
  return function (o: Observable<ActionContext>) {
    return o.pipe(filterStatus(allowedMap, allowedStatusMap), mapOperator());
  };
}

function filterStatus(allowedTypes: FilterMap, allowedStatuses?: FilterMap) {
  return filter((ctx: ActionContext) => {
    const actionType = getActionTypeFromInstance(ctx.action)!;
    const typeMatch = allowedTypes[actionType];
    const statusMatch = allowedStatuses ? allowedStatuses[ctx.status] : true;
    return typeMatch && statusMatch;
  });
}

function mapActionResult(): OperatorFunction<ActionContext, ActionCompletion> {
  return map(({ action, status, error }: ActionContext) => {
    return <ActionCompletion>{
      action,
      result: {
        successful: ActionStatus.Successful === status,
        canceled: ActionStatus.Canceled === status,
        error
      }
    };
  });
}

function mapAction<T = any>(): OperatorFunction<ActionContext, T> {
  return map((ctx: ActionContext) => <T>ctx.action);
}

interface FilterMap {
  [key: string]: boolean;
}

function createAllowedActionTypesMap(types: ActionType[]): FilterMap {
  return types.reduce((filterMap: FilterMap, klass: any) => {
    filterMap[getActionTypeFromInstance(klass)!] = true;
    return filterMap;
  }, <FilterMap>{});
}

function createAllowedStatusesMap(statuses: ActionStatus[]): FilterMap {
  return statuses.reduce((filterMap: FilterMap, status: ActionStatus) => {
    filterMap[status] = true;
    return filterMap;
  }, <FilterMap>{});
}

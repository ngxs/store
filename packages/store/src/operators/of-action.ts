import { OperatorFunction, Observable } from 'rxjs';
import { map, filter } from 'rxjs/operators';

import { ActionType } from '../actions/symbols';
import { getActionTypeFromInstance } from '../utils/utils';
import { ActionContext, ActionStatus } from '../actions-stream';

export interface ActionCompletion<T = any, E = Error> {
  action: T;
  result: {
    successful: boolean;
    canceled: boolean;
    error?: E;
  };
}

export function ofAction<T = any>(allowedType: ActionType): OperatorFunction<ActionContext, T>;
export function ofAction<T = any>(
  ...allowedTypes: ActionType[]
): OperatorFunction<ActionContext, T>;

/**
 * RxJS operator for selecting out specific actions.
 *
 * This will grab actions that have just been dispatched as well as actions that have completed
 */
export function ofAction(...allowedTypes: ActionType[]): OperatorFunction<ActionContext, any> {
  return ofActionOperator(allowedTypes);
}

/**
 * RxJS operator for selecting out specific actions.
 *
 * This will ONLY grab actions that have just been dispatched
 */
export function ofActionDispatched(
  ...allowedTypes: ActionType[]
): OperatorFunction<ActionContext, any> {
  return ofActionOperator(allowedTypes, [ActionStatus.Dispatched]);
}

/**
 * RxJS operator for selecting out specific actions.
 *
 * This will ONLY grab actions that have just been successfully completed
 */
export function ofActionSuccessful(
  ...allowedTypes: ActionType[]
): OperatorFunction<ActionContext, any> {
  return ofActionOperator(allowedTypes, [ActionStatus.Successful]);
}

/**
 * RxJS operator for selecting out specific actions.
 *
 * This will ONLY grab actions that have just been canceled
 */
export function ofActionCanceled(
  ...allowedTypes: ActionType[]
): OperatorFunction<ActionContext, any> {
  return ofActionOperator(allowedTypes, [ActionStatus.Canceled]);
}

/**
 * RxJS operator for selecting out specific actions.
 *
 * This will ONLY grab actions that have just been completed
 */
export function ofActionCompleted(
  ...allowedTypes: ActionType[]
): OperatorFunction<ActionContext, ActionCompletion> {
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
export function ofActionErrored(
  ...allowedTypes: ActionType[]
): OperatorFunction<ActionContext, any> {
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
  return function(o: Observable<ActionContext>) {
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

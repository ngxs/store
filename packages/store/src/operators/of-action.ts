import { OperatorFunction, Observable, merge, combineLatest } from 'rxjs';
import { map, filter, mapTo } from 'rxjs/operators';
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

export function ofAction<T>(allowedType: any): OperatorFunction<ActionContext, T>;
export function ofAction<T>(...allowedTypes: any[]): OperatorFunction<ActionContext, T>;

/**
 * RxJS operator for selecting out specific actions.
 *
 * This will grab actions that have just been dispatched as well as actions that have completed
 */
export function ofAction(...allowedTypes: any[]) {
  return ofActionOperator(allowedTypes);
}

/**
 * RxJS operator for selecting out specific actions.
 *
 * This will ONLY grab actions that have just been dispatched
 */
export function ofActionDispatched(...allowedTypes: any[]) {
  return ofActionOperator(allowedTypes, [ActionStatus.Dispatched]);
}

/**
 * RxJS operator for selecting out specific actions.
 *
 * This will ONLY grab actions that have just been successfully completed
 */
export function ofActionSuccessful(...allowedTypes: any[]) {
  return ofActionOperator(allowedTypes, [ActionStatus.Successful]);
}

/**
 * RxJS operator for selecting out specific actions.
 *
 * This will ONLY grab actions that have just been canceled
 */
export function ofActionCanceled(...allowedTypes: any[]) {
  return ofActionOperator(allowedTypes, [ActionStatus.Canceled]);
}

/**
 * RxJS operator for selecting out specific actions.
 *
 * This will ONLY grab actions that have just been completed
 */
export function ofActionCompleted(...allowedTypes: any[]) {
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
export function ofActionErrored(...allowedTypes: any[]) {
  return ofActionOperator(allowedTypes, [ActionStatus.Errored]);
}

function mapToActionExecuting(allowedType: any) {
  return (source: Observable<ActionContext>) =>
    merge(
      source.pipe(
        ofActionDispatched(allowedType),
        mapTo(true)
      ),
      source.pipe(
        ofActionCompleted(allowedType),
        mapTo(false)
      )
    );
}

/**
 * RxJS operator for selecting out specific actions.
 *
 * This will grab an action and return true when dispatched and false when completed
 * When used with multiple actions, will return true when ALL actions has been dispatched or only some of them has completed,
 * and false when ALL are completed
 */
export function ofActionExecuting(...allowedTypes: any) {
  return (o: Observable<ActionContext>) =>
    combineLatest(...allowedTypes.map((type: any) => o.pipe(mapToActionExecuting(type)))).pipe(
      map((actionsExecuting: boolean[]) => {
        if (actionsExecuting.every(value => value)) return true;
        if (actionsExecuting.every(value => !value)) return false;
        if (actionsExecuting.length > 1 && actionsExecuting.some(value => !value)) return true;

        return false;
      })
    );
}

function ofActionOperator<T = any>(
  allowedTypes: any[],
  statuses?: ActionStatus[],
  mapOperator: () => OperatorFunction<ActionContext, T> = mapAction
) {
  const allowedMap = createAllowedActionTypesMap(allowedTypes);
  const allowedStatusMap = statuses && createAllowedStatusesMap(statuses);
  return function(o: Observable<ActionContext>) {
    return o.pipe(
      filterStatus(allowedMap, allowedStatusMap),
      mapOperator()
    );
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

function createAllowedActionTypesMap(types: any[]): FilterMap {
  return types.reduce(
    (filterMap: FilterMap, klass: any) => {
      filterMap[getActionTypeFromInstance(klass)!] = true;
      return filterMap;
    },
    <FilterMap>{}
  );
}

function createAllowedStatusesMap(statuses: ActionStatus[]): FilterMap {
  return statuses.reduce(
    (filterMap: FilterMap, status: ActionStatus) => {
      filterMap[status] = true;
      return filterMap;
    },
    <FilterMap>{}
  );
}

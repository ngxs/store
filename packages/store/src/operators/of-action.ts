import { OperatorFunction, Observable } from 'rxjs';
import { map, filter } from 'rxjs/operators';
import { getActionTypeFromInstance } from '../utils/utils';
import { ActionContext, ActionStatus } from '../actions-stream';

export function ofAction<T>(allowedType: any): OperatorFunction<any, T>;
export function ofAction<T>(...allowedTypes: any[]): OperatorFunction<any, T>;

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
  const allowedStatuses = [ActionStatus.Successful, ActionStatus.Canceled, ActionStatus.Errored];
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

function ofActionOperator(allowedTypes: any[], statuses?: ActionStatus[], mapOperator = mapAction) {
  const allowedMap = createAllowedActionTypesMap(allowedTypes);
  const allowedStatusMap = statuses && createAllowedStatusesMap(statuses);
  return function (o: Observable<any>) {
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

function mapActionResult() {
  return map(({ action, status, error }: ActionContext) => {
    return {
      action: action,
      result: {
        successful: ActionStatus.Successful === status,
        canceled: ActionStatus.Canceled === status,
        error: error
      }
    };
  });
}

function mapAction() {
  return map((ctx: ActionContext) => ctx.action);
}

type FilterMap = { [key: string]: boolean };

function createAllowedActionTypesMap(types: any[]): FilterMap {
  return types.reduce((filterMap: FilterMap, klass: any) => {
    filterMap[getActionTypeFromInstance(klass)!] = true;
    return filterMap;
  }, {});
}

function createAllowedStatusesMap(statuses: ActionStatus[]): FilterMap {
  return statuses.reduce((filterMap: FilterMap, status: ActionStatus) => {
    filterMap[status] = true;
    return filterMap;
  }, {});
}

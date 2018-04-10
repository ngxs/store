import { filter } from 'rxjs/operators';
import { getActionTypeFromInstance } from './utils';

import { ActionContext, ActionStatus } from './actions-stream';
import { map } from 'rxjs/operators/map';
import { Observable } from 'rxjs/Observable';

// TODO: Fix when RXJS 6 is released
// import { OperatorFunction } from 'rxjs/interfaces';

export function ofAction<T>(allowedType);
export function ofAction<T>(...allowedTypes);

/**
 * RxJS operator for selecting out specific actions.
 *
 * This will grab actions that have just been dispatched as well as actions that have completed
 */
export function ofAction(...allowedTypes: any[]) {
  const allowedMap = createAllowedMap(allowedTypes);

  return function(o: Observable<any>) {
    return o.pipe(filterStatus(allowedMap), mapAction());
  };
}

/**
 * RxJS operator for selecting out specific actions.
 *
 * This will ONLY grab actions that have just been dispatched
 */
export function ofActionDispatched(...allowedTypes: any[]) {
  const allowedMap = createAllowedMap(allowedTypes);

  return function(o: Observable<any>) {
    return o.pipe(filterStatus(allowedMap, ActionStatus.Dispatched), mapAction());
  };
}

/**
 * RxJS operator for selecting out specific actions.
 *
 * This will ONLY grab actions that have just been completed
 */
export function ofActionComplete(...allowedTypes: any[]) {
  const allowedMap = createAllowedMap(allowedTypes);

  return function(o: Observable<any>) {
    return o.pipe(filterStatus(allowedMap, ActionStatus.Completed), mapAction());
  };
}

function filterStatus(allowedTypes: { [key: string]: boolean }, status?: ActionStatus) {
  return filter((ctx: ActionContext<any>) => {
    const actionType = getActionTypeFromInstance(ctx.action);

    if (status) {
      return allowedTypes[actionType] && ctx.status === status;
    }

    return allowedTypes[actionType];
  });
}

function mapAction() {
  return map((ctx: ActionContext<any>) => ctx.action);
}

function createAllowedMap(types: any[]): { [key: string]: boolean } {
  return types.reduce((acc: any, klass: any) => {
    acc[klass.type] = true;

    return acc;
  }, {});
}

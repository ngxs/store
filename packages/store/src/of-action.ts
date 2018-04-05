import { filter } from 'rxjs/operators';
import { getActionTypeFromInstance } from './utils';

// TODO: Fix when RXJS 6 is released
// import { OperatorFunction } from 'rxjs/interfaces';

export function ofAction<T>(allowedType);
export function ofAction<T>(...allowedTypes);

/**
 * RxJS operator for selecting out specific actions.
 */
export function ofAction(...allowedTypes: any[]) {
  const allowedMap = allowedTypes.reduce((acc: any, klass: any) => {
    acc[klass.type] = true;
    return acc;
  }, {});

  return filter(action => allowedMap[getActionTypeFromInstance(action)]);
}

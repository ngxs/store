import { filter } from 'rxjs/operators';
import { OperatorFunction } from 'rxjs';
import { getActionTypeFromInstance } from './utils';

// TODO: Fix when RXJS 6 is released
// import { OperatorFunction } from 'rxjs/interfaces';

export function ofAction<T>(allowedType): OperatorFunction<any, T>;
export function ofAction<T>(...allowedTypes): OperatorFunction<any, T>;

/**
 * RxJS operator for selecting out specific actions.
 */
export function ofAction(...allowedTypes: any[]): OperatorFunction<any, any> {
  const allowedMap = allowedTypes.reduce((acc: any, klass: any) => {
    acc[klass.type] = true;
    return acc;
  }, {});

  return filter(action => allowedMap[getActionTypeFromInstance(action)]);
}

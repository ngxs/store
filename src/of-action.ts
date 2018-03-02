import { filter } from 'rxjs/operators';
import { OperatorFunction } from 'rxjs/interfaces';

export function ofAction<T>(allowedType): OperatorFunction<any, T>;
export function ofAction<T>(...allowedTypes): OperatorFunction<any, T>;
export function ofAction(...allowedTypes: any[]): OperatorFunction<any, any> {
  const allowedMap = {};
  allowedTypes.forEach(klass => (allowedMap[klass.type || klass.name] = true));
  return filter(action => {
    return allowedMap[action.constructor.type || action.constructor.name];
  });
}

import { createSelector } from '../..';
import { TypedSelector } from './selector-types.util';

interface SelectorMap {
  [key: string]: TypedSelector<any>;
}
type MappedSelector<T extends SelectorMap> = (...args: any[]) => MappedResult<T>;
type MappedResult<TSelectorMap> = {
  [P in keyof TSelectorMap]: TSelectorMap[P] extends TypedSelector<infer R> ? R : never;
};
export function createMappedSelector<T extends SelectorMap>(
  selectorMap: T
): MappedSelector<T> {
  const selectors = Object.values(selectorMap);
  const selectorKeys = Object.keys(selectorMap);
  return createSelector(selectors, (...args) => {
    return selectorKeys.reduce((obj, key, index) => {
      (obj as any)[key] = args[index];
      return obj;
    }, {} as MappedResult<T>);
  }) as MappedSelector<T>;
}

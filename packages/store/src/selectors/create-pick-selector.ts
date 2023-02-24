import { createSelector } from '../..';
import { SelectorDef } from './selector-types.util';

type KeysToValues<T, Keys extends (keyof T)[]> = {
  [Index in keyof Keys]: Keys[Index] extends keyof T ? T[Keys[Index]] : never;
};
export function createPickSelector<TModel, Keys extends (keyof TModel)[]>(
  state: SelectorDef<TModel>,
  keys: [...Keys]
) {
  const selectors = keys.map((key) => createSelector([state], (s: TModel) => s[key]));
  return createSelector([...selectors], (...props: KeysToValues<TModel, Keys>) => {
    return keys.reduce((acc, key, index) => {
      acc[key] = props[index];
      return acc;
    }, {} as Pick<TModel, Keys[number]>);
  });
}

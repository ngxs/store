import { createSelector } from './create-selector';
import { ensureValidSelector } from './selector-checks.util';
import { TypedSelector } from './selector-types.util';

type KeysToValues<T, Keys extends (keyof T)[]> = {
  [Index in keyof Keys]: Keys[Index] extends keyof T ? T[Keys[Index]] : never;
};

export function createPickSelector<TModel, Keys extends (keyof TModel)[]>(
  selector: TypedSelector<TModel>,
  keys: [...Keys]
) {
  if (typeof ngDevMode !== 'undefined' && ngDevMode) {
    ensureValidSelector(selector, { prefix: '[createPickSelector]' });
  }
  const validKeys = keys.filter(Boolean);
  const selectors = validKeys.map(key =>
    // Optional chaining is used because the state being selected may not be
    // registered yet — for example, if the selector is called before `provideStates()`.
    createSelector([selector], (state: TModel) => state?.[key])
  );
  return createSelector([...selectors], (...props: KeysToValues<TModel, Keys>) => {
    return validKeys.reduce(
      (acc, key, index) => {
        acc[key] = props[index];
        return acc;
      },
      {} as Pick<TModel, Keys[number]>
    );
  });
}

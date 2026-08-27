import { createSelector } from './create-selector';
import { ensureValidSelector } from './selector-checks.util';
import { ɵSelectorDef } from './selector-types.util';

export type PropertySelectors<TModel> = {
  [P in keyof NonNullable<TModel>]-?: (
    model: TModel
  ) => TModel extends null | undefined ? undefined : NonNullable<TModel>[P];
};

export function createPropertySelectors<TModel>(
  parentSelector: ɵSelectorDef<TModel>
): PropertySelectors<TModel> {
  if (typeof ngDevMode !== 'undefined' && ngDevMode) {
    ensureValidSelector(parentSelector, {
      prefix: '[createPropertySelectors]',
      noun: 'parent selector'
    });
  }
  // Use a plain empty object with no prototype. A normal `{}` already has keys
  // like `toString` and `constructor` on it, so `cache['toString']` would look
  // like it's already cached and we'd hand back the wrong thing.
  const cache: Record<string, PropertySelectors<TModel>[keyof TModel]> = Object.create(null);
  return new Proxy<PropertySelectors<TModel>>(
    {} as unknown as PropertySelectors<TModel>,
    {
      get(_target: any, prop: string | symbol) {
        // This runs for anything someone reads off the object, not just real
        // state fields. We only want to build a selector for a normal string
        // key. Skip symbols. Also skip `then`: if this object had a `then`
        // function, JavaScript would treat it like a promise, so things like
        // `await propSelectors` would call it by accident.
        if (typeof prop !== 'string' || prop === 'then') {
          return undefined;
        }
        const selector =
          cache[prop] ||
          (createSelector(
            [parentSelector],
            // Optional chaining is used because the state being selected may not be
            // registered yet — for example, if the selector is called before `provideStates()`.
            (state: TModel) => state?.[prop as keyof TModel]
          ) as PropertySelectors<TModel>[keyof TModel]);
        cache[prop] = selector;
        return selector;
      }
    } as ProxyHandler<PropertySelectors<TModel>>
  );
}

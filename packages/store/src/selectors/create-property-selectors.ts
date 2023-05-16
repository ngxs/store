import { createSelector } from './create-selector';
import { ensureValidSelector } from './selector-checks.util';
import { SelectorDef } from './selector-types.util';

export type PropertySelectors<TModel> = {
  [P in keyof NonNullable<TModel>]-?: (
    model: TModel
  ) => TModel extends null | undefined ? undefined : NonNullable<TModel>[P];
};

export function createPropertySelectors<TModel>(
  parentSelector: SelectorDef<TModel>
): PropertySelectors<TModel> {
  if (typeof ngDevMode === 'undefined' || ngDevMode) {
    ensureValidSelector(parentSelector, {
      prefix: '[createPropertySelectors]',
      noun: 'parent selector'
    });
  }
  const cache: Partial<PropertySelectors<TModel>> = {};
  return new Proxy<PropertySelectors<TModel>>(
    {} as unknown as PropertySelectors<TModel>,
    {
      get(_target: any, prop: keyof TModel) {
        const selector =
          cache[prop] ||
          (createSelector(
            [parentSelector],
            (s: TModel) => s?.[prop]
          ) as PropertySelectors<TModel>[typeof prop]);
        cache[prop] = selector;
        return selector;
      }
    } as ProxyHandler<PropertySelectors<TModel>>
  );
}

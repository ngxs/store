import { createSelector } from '../..';
import { SelectorDef } from './selector-types.util';

export type PropertySelectors<TModel> = {
  [P in keyof NonNullable<TModel>]-?: (
    model: TModel
  ) => TModel extends null | undefined ? undefined : NonNullable<TModel>[P];
};
export function createPropertySelectors<TModel>(
  state: SelectorDef<TModel>
): PropertySelectors<TModel> {
  const cache: Partial<PropertySelectors<TModel>> = {};
  return new Proxy<PropertySelectors<TModel>>(
    {} as unknown as PropertySelectors<TModel>,
    {
      get(_target: any, prop: keyof TModel) {
        const selector =
          cache[prop] ||
          (createSelector(
            [state],
            (s: TModel) => s?.[prop]
          ) as PropertySelectors<TModel>[typeof prop]);
        cache[prop] = selector;
        return selector;
      },
    } as ProxyHandler<PropertySelectors<TModel>>
  );
}

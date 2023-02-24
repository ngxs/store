import { getSelectorMetadata, getStoreMetadata } from '../internal/internals';
import { createSelector } from '../utils/selector-utils';
import { SelectorDef } from './selector-types.util';

export type PropertySelectors<TModel> = {
  [P in keyof NonNullable<TModel>]-?: (
    model: TModel
  ) => TModel extends null | undefined ? undefined : NonNullable<TModel>[P];
};

export function createPropertySelectors<TModel>(
  parentSelector: SelectorDef<TModel>
): PropertySelectors<TModel> {
  const cache: Partial<PropertySelectors<TModel>> = {};
  if (!parentSelector) {
    throw new Error('A parent selector must be provided to create property selectors.');
  }
  const metadata =
    getSelectorMetadata(parentSelector) || getStoreMetadata(parentSelector as any);
  if (!metadata) {
    throw new Error('The value provided as the parent selector is not a valid selector.');
  }
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
      },
    } as ProxyHandler<PropertySelectors<TModel>>
  );
}

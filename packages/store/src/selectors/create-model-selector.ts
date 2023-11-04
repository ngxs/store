import { createSelector } from './create-selector';
import { ensureValidSelector, ensureValueProvided } from './selector-checks.util';
import { TypedSelector } from './selector-types.util';

interface SelectorMap {
  [key: string]: TypedSelector<any>;
}

type ModelSelector<T extends SelectorMap> = (...args: any[]) => MappedResult<T>;

type MappedResult<TSelectorMap> = {
  [P in keyof TSelectorMap]: TSelectorMap[P] extends TypedSelector<infer R> ? R : never;
};

export function createModelSelector<T extends SelectorMap>(selectorMap: T): ModelSelector<T> {
  const selectorKeys = Object.keys(selectorMap);
  const selectors = Object.values(selectorMap);

  if (typeof ngDevMode === 'undefined' || ngDevMode) {
    ensureValidSelectorMap<T>({
      prefix: '[createModelSelector]',
      selectorMap,
      selectorKeys,
      selectors
    });
  }

  return createSelector(selectors, (...args) => {
    return selectorKeys.reduce((obj, key, index) => {
      (obj as any)[key] = args[index];
      return obj;
    }, {} as MappedResult<T>);
  }) as ModelSelector<T>;
}

function ensureValidSelectorMap<T extends SelectorMap>({
  prefix,
  selectorMap,
  selectorKeys,
  selectors
}: {
  prefix: string;
  selectorMap: T;
  selectorKeys: string[];
  selectors: TypedSelector<any>[];
}) {
  ensureValueProvided(selectorMap, { prefix, noun: 'selector map' });
  ensureValueProvided(typeof selectorMap === 'object', { prefix, noun: 'valid selector map' });
  ensureValueProvided(selectorKeys.length, { prefix, noun: 'non-empty selector map' });
  selectors.forEach((selector, index) =>
    ensureValidSelector(selector, {
      prefix,
      noun: `selector for the '${selectorKeys[index]}' property`
    })
  );
}

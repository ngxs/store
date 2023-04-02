import { StateClass } from '@ngxs/store/internals';

import { ensureStoreMetadata, MetaDataModel, StateClassInternal } from '../internal/internals';
import { META_KEY, META_OPTIONS_KEY, StoreOptions } from '../symbols';
import { StoreValidators } from '../utils/store-validators';

interface MutateMetaOptions<T> {
  meta: MetaDataModel;
  inheritedStateClass: StateClassInternal;
  optionsWithInheritance: StoreOptions<T>;
}

/**
 * Decorates a class with ngxs state information.
 */
export function State<T>(options: StoreOptions<T>) {
  function getStateOptions(inheritedStateClass: StateClassInternal): StoreOptions<T> {
    const inheritanceOptions: Partial<StoreOptions<T>> =
      inheritedStateClass[META_OPTIONS_KEY] || {};
    return { ...inheritanceOptions, ...options } as StoreOptions<T>;
  }

  function mutateMetaData(params: MutateMetaOptions<T>): void {
    const { meta, inheritedStateClass, optionsWithInheritance } = params;
    const { children, defaults, name } = optionsWithInheritance;
    const stateName: string | null =
      typeof name === 'string' ? name : (name && name.getName()) || null;

    // Caretaker note: we have still left the `typeof` condition in order to avoid
    // creating a breaking change for projects that still use the View Engine.
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      StoreValidators.checkThatStateIsNamedCorrectly(stateName);
    }

    if (inheritedStateClass.hasOwnProperty(META_KEY)) {
      const inheritedMeta: Partial<MetaDataModel> = inheritedStateClass[META_KEY] || {};

      const inheritedActions = { ...inheritedMeta.actions };
      for (const actions in inheritedActions) {
        for (const action of inheritedActions[actions]) {
          const clonedAction = { ...action };

          if (action.options.newActionHandlerForChild) {
            const clonedActionType = `[${name}] ${action.type}`;
            clonedAction.type = clonedActionType;

            if (!inheritedActions[clonedActionType]) {
              if (inheritedActions[action.type]) {
                delete inheritedActions[action.type];
              }
              inheritedActions[clonedActionType] = [];
            }

            inheritedActions[clonedActionType].push(clonedAction);
          }
        }
      }

      meta.actions = { ...meta.actions, ...inheritedActions };
    }

    meta.children = children;
    meta.defaults = defaults;
    meta.name = stateName;
  }

  return (target: StateClass): void => {
    const stateClass: StateClassInternal = target;
    const meta: MetaDataModel = ensureStoreMetadata(stateClass);
    const inheritedStateClass: StateClassInternal = Object.getPrototypeOf(stateClass);
    const optionsWithInheritance: StoreOptions<T> = getStateOptions(inheritedStateClass);
    mutateMetaData({ meta, inheritedStateClass, optionsWithInheritance });
    stateClass[META_OPTIONS_KEY] = optionsWithInheritance;
  };
}

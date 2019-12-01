import { StateClass } from '@ngxs/store/internals';

import { ensureStoreMetadata, MetaDataModel, StateClassInternal } from '../internal/internals';
import { META_KEY, META_OPTIONS_KEY, StoreOptions } from '../symbols';
import { StoreValidators } from '../utils/store-validators';
import { ivyEnabledInJitMode } from '../ivy/ivy-enabled-in-jit-mode';
import { CONFIG_MESSAGES, VALIDATION_CODE } from '../configs/messages.config';

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
    StoreValidators.checkCorrectStateName(stateName);

    if (inheritedStateClass.hasOwnProperty(META_KEY)) {
      const inheritedMeta: Partial<MetaDataModel> = inheritedStateClass[META_KEY] || {};
      meta.actions = { ...meta.actions, ...inheritedMeta.actions };
    }

    meta.children = children;
    meta.defaults = defaults;
    meta.name = stateName;
  }

  return (target: StateClass): void => {
    ensureStateClassIsInjectable(target);
    const stateClass: StateClassInternal = target;
    const meta: MetaDataModel = ensureStoreMetadata(stateClass);
    const inheritedStateClass: StateClassInternal = Object.getPrototypeOf(stateClass);
    const optionsWithInheritance: StoreOptions<T> = getStateOptions(inheritedStateClass);
    mutateMetaData({ meta, inheritedStateClass, optionsWithInheritance });
    stateClass[META_OPTIONS_KEY] = optionsWithInheritance;
  };
}

function ensureStateClassIsInjectable(target: StateClass): void {
  // `ɵprov` is a static property added by the NGC compiler running with Ivy
  // enabled. It always exists in the AOT mode because this property is added before
  // runtime. If app is running in JIT mode then this property can be added by the
  // `@Injectable()` decorator. The `@Injectable()` decorator has to go after the
  // `@State()` decorator, thus we prevent users from unwanted DI errors.
  if (ivyEnabledInJitMode()) {
    // Do not run this check if Ivy is disabled or `ɵprov` exists on the class
    const ngInjectableDef = (target as any).ɵprov;
    if (ngInjectableDef) {
      return;
    }
    console.warn(CONFIG_MESSAGES[VALIDATION_CODE.UNDECORATED_STATE_IN_IVY](target.name));
  }
}

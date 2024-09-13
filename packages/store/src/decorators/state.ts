import { inject } from '@angular/core';
import {
  ɵMETA_KEY,
  ɵMETA_OPTIONS_KEY,
  ɵMetaDataModel,
  ɵStateClass,
  ɵStateClassInternal,
  ɵStoreOptions,
  ɵensureStoreMetadata
} from '@ngxs/store/internals';
import { Observable } from 'rxjs';

import { StateOperator } from '../symbols';
import { ensureStateNameIsValid } from '../utils/store-validators';
import { StateContextFactory } from '../internal/state-context-factory';

interface MutateMetaOptions<T> {
  meta: ɵMetaDataModel;
  inheritedStateClass: ɵStateClassInternal;
  optionsWithInheritance: ɵStoreOptions<T>;
}

interface BaseState<T> {
  getState(): T;
  setState(value: T): void;
  patchState(value: Partial<T>): void;
  dispatch(actions: any | any[]): Observable<void>;
}

interface StateDecorator<T> {
  (target: ɵStateClass): void;
  new (): BaseState<T>;
}

/**
 * Decorates a class with ngxs state information.
 */
export function State<T>(options: ɵStoreOptions<T>): StateDecorator<T> {
  return function (this: BaseState<T>) {
    // eslint-disable-next-line prefer-rest-params
    const stateClass = (new.target || arguments[0]) as unknown as ɵStateClassInternal;
    const meta: ɵMetaDataModel = ɵensureStoreMetadata(stateClass);
    const inheritedStateClass: ɵStateClassInternal = Object.getPrototypeOf(stateClass);
    const optionsWithInheritance: ɵStoreOptions<T> = getStateOptions(
      inheritedStateClass,
      options
    );
    mutateMetaData<T>({ meta, inheritedStateClass, optionsWithInheritance });
    stateClass[ɵMETA_OPTIONS_KEY] = optionsWithInheritance;

    // If this function is being called as a constructor function.
    if (new.target) {
      const stateContextFactory = inject(StateContextFactory);

      this.getState = () => {
        const ctx = stateContextFactory.createStateContext<T>(meta.path!);
        return ctx.getState();
      };

      this.setState = (value: T | StateOperator<T>) => {
        const ctx = stateContextFactory.createStateContext<T>(meta.path!);
        ctx.setState(value);
      };

      this.patchState = (value: Partial<T>) => {
        const ctx = stateContextFactory.createStateContext<T>(meta.path!);
        ctx.patchState(value);
      };

      this.dispatch = actions => {
        const ctx = stateContextFactory.createStateContext<T>(meta.path!);
        return ctx.dispatch(actions);
      };
    }
  } as unknown as StateDecorator<T>;
}

function getStateOptions<T>(
  inheritedStateClass: ɵStateClassInternal,
  options: ɵStoreOptions<T>
): ɵStoreOptions<T> {
  const inheritanceOptions: Partial<ɵStoreOptions<T>> =
    inheritedStateClass[ɵMETA_OPTIONS_KEY] || {};
  return { ...inheritanceOptions, ...options } as ɵStoreOptions<T>;
}

function mutateMetaData<T>(params: MutateMetaOptions<T>): void {
  const { meta, inheritedStateClass, optionsWithInheritance } = params;
  const { children, defaults, name } = optionsWithInheritance;
  const stateName: string | null =
    typeof name === 'string' ? name : (name && name.getName()) || null;

  if (typeof ngDevMode !== 'undefined' && ngDevMode) {
    ensureStateNameIsValid(stateName);
  }

  if (inheritedStateClass.hasOwnProperty(ɵMETA_KEY)) {
    const inheritedMeta: Partial<ɵMetaDataModel> = inheritedStateClass[ɵMETA_KEY] || {};
    meta.actions = { ...meta.actions, ...inheritedMeta.actions };
  }

  meta.children = children;
  meta.defaults = defaults;
  meta.name = stateName;
}

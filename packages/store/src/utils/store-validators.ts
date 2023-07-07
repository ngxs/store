import { getStoreMetadata, StateClassInternal, StatesByName } from '../internal/internals';
import {
  throwStateDecoratorError,
  throwStateNameError,
  throwStateNamePropertyError,
  throwStateUniqueError
} from '../configs/messages.config';

const stateNameRegex = new RegExp('^[a-zA-Z0-9_]+$');

export function ensureStateNameIsValid(name: string | null): void | never {
  if (!name) {
    throwStateNamePropertyError();
  } else if (!stateNameRegex.test(name)) {
    throwStateNameError(name);
  }
}

export function ensureStateNameIsUnique(
  stateName: string,
  state: StateClassInternal,
  statesByName: StatesByName
): void | never {
  const existingState = statesByName[stateName];
  if (existingState && existingState !== state) {
    throwStateUniqueError(stateName, state.name, existingState.name);
  }
}

export function ensureStatesAreDecorated(stateClasses: StateClassInternal[]): void | never {
  stateClasses.forEach((stateClass: StateClassInternal) => {
    if (!getStoreMetadata(stateClass)) {
      throwStateDecoratorError(stateClass.name);
    }
  });
}

import { getStoreMetadata, StateClassInternal, StatesByName } from '../internal/internals';
import {
  throwStateDecoratorError,
  throwStateNameError,
  throwStateNamePropertyError,
  throwStateUniqueError
} from '../configs/messages.config';

export abstract class StoreValidators {
  private static stateNameRegex: RegExp = new RegExp('^[a-zA-Z0-9_]+$');

  static checkThatStateIsNamedCorrectly(name: string | null): void | never {
    if (!name) {
      throwStateNamePropertyError();
    } else if (!this.stateNameRegex.test(name)) {
      throwStateNameError(name);
    }
  }

  static checkThatStateNameIsUnique(
    stateName: string,
    state: StateClassInternal,
    statesByName: StatesByName
  ): void | never {
    const existingState = statesByName[stateName];
    if (existingState && existingState !== state) {
      throwStateUniqueError(stateName, state.name, existingState.name);
    }
  }

  static checkThatStateClassesHaveBeenDecorated(
    stateClasses: StateClassInternal[]
  ): void | never {
    stateClasses.forEach((stateClass: StateClassInternal) => {
      if (!getStoreMetadata(stateClass)) {
        throwStateDecoratorError(stateClass.name);
      }
    });
  }
}

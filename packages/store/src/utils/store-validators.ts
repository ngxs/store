import {
  getStoreMetadata,
  MetaDataModel,
  StateClassInternal,
  StatesByName
} from '../internal/internals';
import {
  CONFIG_MESSAGES as MESSAGES,
  VALIDATION_CODE as CODE
} from '../configs/messages.config';

export abstract class StoreValidators {
  public static stateNameRegex: RegExp = new RegExp('^[a-zA-Z0-9_]+$');

  public static stateNameErrorMessage(name: string) {
    return MESSAGES[CODE.STATE_NAME](name);
  }

  public static checkCorrectStateName(name: string | null) {
    if (!name) {
      throw new Error(MESSAGES[CODE.STATE_NAME_PROPERTY]());
    }

    if (!this.stateNameRegex.test(name)) {
      throw new Error(this.stateNameErrorMessage(name));
    }
  }

  public static checkStateNameIsUnique(
    state: StateClassInternal,
    statesByName: StatesByName
  ): string {
    const meta: MetaDataModel = this.getValidStateMeta(state);
    const stateName: string = meta!.name as string;
    const existingState = statesByName[stateName];
    if (existingState && existingState !== state) {
      throw new Error(MESSAGES[CODE.STATE_UNIQUE](stateName, state.name, existingState.name));
    }
    return stateName;
  }

  public static getValidStateMeta(state: StateClassInternal): MetaDataModel {
    const meta: MetaDataModel = getStoreMetadata(state);
    if (!meta) {
      throw new Error(MESSAGES[CODE.STATE_DECORATOR]());
    }

    return meta;
  }
}

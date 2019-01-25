import { MetaDataModel, StateClass } from '../internal/internals';
import { META_KEY, StateClassName, StateName } from '../symbols';

export abstract class StoreValidators {
  public static stateNameRegex: RegExp = new RegExp('^[a-zA-Z0-9_]+$');

  public static stateNameErrorMessage(name: string) {
    return `${name} is not a valid state name. It needs to be a valid object property name.`;
  }

  public static checkCorrectStateName(name: string) {
    if (!name) {
      throw new Error(`States must register a 'name' property`);
    }

    if (!this.stateNameRegex.test(name)) {
      throw new Error(this.stateNameErrorMessage(name));
    }
  }

  public static getValidStateNamesMap(states: StateClass[]): Map<StateName, StateClassName> {
    const uniqueStateNamesMap: Map<StateName, StateClassName> = new Map();

    for (let i = 0, size: number = states.length; i < size; i++) {
      const state: StateClass = states[i]!;
      const meta: MetaDataModel = this.getValidStateMeta(state);
      const stateName: string = meta!.name as string;

      if (uniqueStateNamesMap.has(stateName)) {
        const previousStateName: string = uniqueStateNamesMap.get(stateName) as string;
        throw new Error(`State name ${state.name} in ${previousStateName} already exists`);
      } else {
        uniqueStateNamesMap.set(stateName, state.name);
      }
    }

    return uniqueStateNamesMap;
  }

  public static getValidStateMeta(state: StateClass): MetaDataModel {
    const meta: MetaDataModel = state[META_KEY]!;
    if (!meta) {
      throw new Error('States must be decorated with @State() decorator');
    }

    return meta;
  }
}

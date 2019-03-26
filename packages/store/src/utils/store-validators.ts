import {
  getStoreMetadata,
  MetaDataModel,
  StateClass,
  StatesByName
} from '../internal/internals';

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

  public static checkStateNameIsUnique(state: StateClass, statesByName: StatesByName): string {
    const meta: MetaDataModel = this.getValidStateMeta(state);
    const stateName: string = meta!.name as string;
    const existingState = statesByName[stateName];
    if (existingState && existingState !== state) {
      throw new Error(
        `State name '${stateName}' from ${state.name} already exists in ${existingState.name}`
      );
    }
    return stateName;
  }

  public static getValidStateMeta(state: StateClass): MetaDataModel {
    const meta: MetaDataModel = getStoreMetadata(state);
    if (!meta) {
      throw new Error('States must be decorated with @State() decorator');
    }

    return meta;
  }

  public static throwWhenIncorrectProduction(): void {
    throw new Error(
      'Angular is running in production mode but NGXS is still running in the development mode!\n' +
        'Please set developmentMode to false on the NgxsModule options when in production mode.\n' +
        'NgxsModule.forRoot(states, { developmentMode: !environment.production })'
    );
  }

  public static throwWhenIncorrectDevelopment(): void {
    throw new Error(
      'RECOMMENDATION: Set developmentMode to true on the NgxsModule when Angular is running in development mode.\n' +
        'NgxsModule.forRoot(states, { developmentMode: !environment.production })'
    );
  }
}

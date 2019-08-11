import { ObjectKeyMap } from '@ngxs/store/internals';

export enum VALIDATION_CODE {
  STATE_NAME = 'STATE_NAME',
  STATE_UNIQUE = 'STATE_UNIQUE',
  STATE_NAME_PROPERTY = 'STATE_NAME_PROPERTY',
  STATE_DECORATOR = 'STATE_DECORATOR',
  INCORRECT_PRODUCTION = 'INCORRECT_PRODUCTION',
  INCORRECT_DEVELOPMENT = 'INCORRECT_DEVELOPMENT',
  SELECT_NOT_CONNECTED = 'SELECT_NOT_CONNECTED',
  SELECT_FACTORY_NOT_CONNECTED = 'SELECT_FACTORY_NOT_CONNECTED',
  SELECT_CLASS_NOT_EXTENSIBLE = 'CLASS_NOT_EXTENSIBLE',
  ACTION_DECORATOR = 'ACTION_DECORATOR',
  SELECTOR_DECORATOR = 'SELECTOR_DECORATOR'
}

export const CONFIG_MESSAGES: ObjectKeyMap<Function> = {
  [VALIDATION_CODE.STATE_NAME]: (name: string) =>
    `${name} is not a valid state name. It needs to be a valid object property name.`,
  [VALIDATION_CODE.STATE_NAME_PROPERTY]: () => `States must register a 'name' property`,
  [VALIDATION_CODE.STATE_UNIQUE]: (current: string, newName: string, oldName: string) =>
    `State name '${current}' from ${newName} already exists in ${oldName}`,
  [VALIDATION_CODE.STATE_DECORATOR]: () => 'States must be decorated with @State() decorator',
  [VALIDATION_CODE.INCORRECT_PRODUCTION]: () =>
    'Angular is running in production mode but NGXS is still running in the development mode!\n' +
    'Please set developmentMode to false on the NgxsModule options when in production mode.\n' +
    'NgxsModule.forRoot(states, { developmentMode: !environment.production })',
  [VALIDATION_CODE.INCORRECT_DEVELOPMENT]: () =>
    'RECOMMENDATION: Set developmentMode to true on the NgxsModule when Angular is running in development mode.\n' +
    'NgxsModule.forRoot(states, { developmentMode: !environment.production })',
  [VALIDATION_CODE.SELECT_FACTORY_NOT_CONNECTED]: () =>
    'SelectFactory not connected to store!',
  [VALIDATION_CODE.SELECT_NOT_CONNECTED]: () =>
    `You can't use @Select your instance is frozen`,
  [VALIDATION_CODE.SELECT_CLASS_NOT_EXTENSIBLE]: () =>
    `Your class is not extensible for @Select`,
  [VALIDATION_CODE.ACTION_DECORATOR]: () =>
    '@Action() decorator cannot be used with static methods',
  [VALIDATION_CODE.SELECTOR_DECORATOR]: () => 'Selectors only work on methods'
};

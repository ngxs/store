export enum VALIDATION_CODE {
  STATE_NAME = 'STATE_NAME',
  STATE_UNIQUE = 'STATE_UNIQUE',
  STATE_NAME_PROPERTY = 'STATE_NAME_PROPERTY',
  STATE_DECORATOR = 'STATE_DECORATOR',
  INCORRECT_PRODUCTION = 'INCORRECT_PRODUCTION',
  INCORRECT_DEVELOPMENT = 'INCORRECT_DEVELOPMENT',
  SELECT_FACTORY_NOT_CONNECTED = 'SELECT_FACTORY_NOT_CONNECTED',
  ACTION_DECORATOR = 'ACTION_DECORATOR',
  SELECTOR_DECORATOR = 'SELECTOR_DECORATOR',
  ZONE_WARNING = 'ZONE_WARNING',
  PATCHING_ARRAY = 'PATCHING_ARRAY',
  PATCHING_PRIMITIVE = 'PATCHING_PRIMITIVE',
  UNDECORATED_STATE_IN_IVY = 'UNDECORATED_STATE_IN_IVY'
}

export const CONFIG_MESSAGES = {
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
    'You have forgotten to import the NGXS module!',
  [VALIDATION_CODE.ACTION_DECORATOR]: () =>
    '@Action() decorator cannot be used with static methods',
  [VALIDATION_CODE.SELECTOR_DECORATOR]: () => 'Selectors only work on methods',
  [VALIDATION_CODE.ZONE_WARNING]: () =>
    'Your application was bootstrapped with nooped zone and your execution strategy requires an actual NgZone!\n' +
    'Please set the value of the executionStrategy property to NoopNgxsExecutionStrategy.\n' +
    'NgxsModule.forRoot(states, { executionStrategy: NoopNgxsExecutionStrategy })',
  [VALIDATION_CODE.PATCHING_ARRAY]: () => 'Patching arrays is not supported.',
  [VALIDATION_CODE.PATCHING_PRIMITIVE]: () => 'Patching primitives is not supported.',
  [VALIDATION_CODE.UNDECORATED_STATE_IN_IVY]: (name: string) =>
    `'${name}' class should be decorated with @Injectable() right after the @State() decorator`
};

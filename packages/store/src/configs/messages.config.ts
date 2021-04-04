export enum VALIDATION_CODE {
  INCORRECT_PRODUCTION = 'INCORRECT_PRODUCTION',
  INCORRECT_DEVELOPMENT = 'INCORRECT_DEVELOPMENT',
  SELECT_FACTORY_NOT_CONNECTED = 'SELECT_FACTORY_NOT_CONNECTED',
  PATCHING_ARRAY = 'PATCHING_ARRAY',
  PATCHING_PRIMITIVE = 'PATCHING_PRIMITIVE'
}

// TODO: these messages might be tree-shaken away in the future.
export const CONFIG_MESSAGES = {
  [VALIDATION_CODE.INCORRECT_PRODUCTION]: () =>
    'Angular is running in production mode but NGXS is still running in the development mode!\n' +
    'Please set developmentMode to false on the NgxsModule options when in production mode.\n' +
    'NgxsModule.forRoot(states, { developmentMode: !environment.production })',
  [VALIDATION_CODE.INCORRECT_DEVELOPMENT]: () =>
    'RECOMMENDATION: Set developmentMode to true on the NgxsModule when Angular is running in development mode.\n' +
    'NgxsModule.forRoot(states, { developmentMode: !environment.production })',
  [VALIDATION_CODE.SELECT_FACTORY_NOT_CONNECTED]: () =>
    'You have forgotten to import the NGXS module!',
  // This can be a breaking change if we don't throw these errors even in production mode.
  [VALIDATION_CODE.PATCHING_ARRAY]: () => 'Patching arrays is not supported.',
  [VALIDATION_CODE.PATCHING_PRIMITIVE]: () => 'Patching primitives is not supported.'
};

// The below functions are decoupled from the `CONFIG_MESSAGES` object for now, since object properties
// are not tree-shakable. That means that if the error is thrown only in development mode it still will get
// bundled into the final file. This is how Angular does error tree-shaking internally.

export function throwStateNameError(name: string): never {
  throw new Error(
    `${name} is not a valid state name. It needs to be a valid object property name.`
  );
}

export function throwStateNamePropertyError(): never {
  throw new Error(`States must register a 'name' property.`);
}

export function throwStateUniqueError(
  current: string,
  newName: string,
  oldName: string
): never {
  throw new Error(`State name '${current}' from ${newName} already exists in ${oldName}.`);
}

export function throwStateDecoratorError(name: string): never {
  throw new Error(`States must be decorated with @State() decorator, but "${name}" isn't.`);
}

export function throwActionDecoratorError(): never {
  throw new Error('@Action() decorator cannot be used with static methods.');
}

export function throwSelectorDecoratorError(): never {
  throw new Error('Selectors only work on methods.');
}

export function getZoneWarningMessage(): string {
  return (
    'Your application was bootstrapped with nooped zone and your execution strategy requires an actual NgZone!\n' +
    'Please set the value of the executionStrategy property to NoopNgxsExecutionStrategy.\n' +
    'NgxsModule.forRoot(states, { executionStrategy: NoopNgxsExecutionStrategy })'
  );
}

export function getUndecoratedStateInIvyWarningMessage(name: string): string {
  return `'${name}' class should be decorated with @Injectable() right after the @State() decorator`;
}

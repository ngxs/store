import { PlainObject } from '@ngxs/store/internals';

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

export function getInvalidInitializationOrderMessage(addedStates?: PlainObject) {
  let message =
    'You have an invalid state initialization order. This typically occurs when `NgxsModule.forFeature`\n' +
    'or `provideStates` is called before `NgxsModule.forRoot` or `provideStore`.\n' +
    'One example is when `NgxsRouterPluginModule.forRoot` is called before `NgxsModule.forRoot`.';

  if (addedStates) {
    const stateNames = Object.keys(addedStates).map(stateName => `"${stateName}"`);

    message +=
      '\nFeature states added before the store initialization is complete: ' +
      `${stateNames.join(', ')}.`;
  }

  return message;
}

export function throwSelectFactoryNotConnectedError(): never {
  throw new Error('You have forgotten to import the NGXS module!');
}

export function throwPatchingArrayError(): never {
  throw new Error('Patching arrays is not supported.');
}

export function throwPatchingPrimitiveError(): never {
  throw new Error('Patching primitives is not supported.');
}

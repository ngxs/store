export { NgxsModule } from './module';
export { Action } from './decorators/action';
export { Store } from './store';
export { State } from './decorators/state';
export { Select } from './decorators/select/select';
export { SelectorOptions } from './decorators/selector-options';
export { Actions, ActionContext, ActionStatus } from './actions-stream';

// TODO: v4 - We need to come up with an alternative api to exposing this metadata
//   because it is currently used by the following (after a github search):
// - https://github.com/ngxs-labs/emitter/blob/81d21d135400d7e3765fc579e09aea29b1b92bf7/emitter/src/lib/core/decorators/receiver.ts#L91
// - https://github.com/ngxs-labs/data/blob/73a320059f21924eb975a86adae5169a404071fd/src/lib/decorators/persistence/persistence.ts#L13
// - https://github.com/ng-turkey/ngxs-reset-plugin/blob/0f22f22e277c7de5b340d1917aae303d01020cee/src/lib/reset.plugin.ts#L19
// tslint:disable: max-line-length
// - https://github.com/ngxs-labs/firebase-plugin/blob/7251d877aeadefea8c3c891b7b55e7653a9f289c/src/lib/decorators/ngxs-firestore-connect.ts#L23
// - https://github.com/stefan-schubert/ngxs-extensions/blob/922ee2f87eba17823b5efab142b656b0d29f827d/src/lib/core/decorators/reset-state.decorator.ts#L18
// tslint:enable: max-line-length
export {
  getSelectorMetadata,
  getStoreMetadata,
  ensureStoreMetadata,
  ensureSelectorMetadata
} from './public_to_deprecate';
export {
  ofAction,
  ofActionDispatched,
  ofActionSuccessful,
  ofActionCanceled,
  ofActionErrored,
  ofActionCompleted,
  ActionCompletion
} from './operators/of-action';
export {
  StateContext,
  StateOperator,
  NgxsOnInit,
  NgxsAfterBootstrap,
  NgxsOnChanges,
  NgxsModuleOptions,
  NgxsSimpleChange
} from './symbols';
export { Selector } from './decorators/selector/selector';
export { getActionTypeFromInstance, actionMatcher } from './utils/utils';
export { NgxsExecutionStrategy } from './execution/symbols';
export { ActionType, ActionOptions } from './actions/symbols';
export { NoopNgxsExecutionStrategy } from './execution/noop-ngxs-execution-strategy';
export { StateToken } from './state-token/state-token';

export { NgxsDevelopmentOptions } from './dev-features/symbols';
export { NgxsDevelopmentModule } from './dev-features/ngxs-development.module';
export { NgxsUnhandledActionsLogger } from './dev-features/ngxs-unhandled-actions-logger';

export {
  createModelSelector,
  createPickSelector,
  createPropertySelectors,
  createSelector,
  PropertySelectors,
  TypedSelector
} from './selectors';

export * from './standalone-features';

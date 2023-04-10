/**
 * @module
 * @description
 * Entry point for all public APIs of this package.
 */
export { append } from './append';
export { compose } from './compose';
export { iif } from './iif';
export { insertItem } from './insert-item';
export { patch, ɵPatchSpec } from './patch';
export { isStateOperator, isPredicate, Predicate } from './utils';
export { updateItem } from './update-item';
export { removeItem } from './remove-item';
export { ExistingState, NoInfer, StateOperator } from './types';

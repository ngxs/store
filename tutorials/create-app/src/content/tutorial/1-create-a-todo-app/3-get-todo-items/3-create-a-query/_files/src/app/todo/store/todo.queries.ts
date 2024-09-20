import { createPropertySelectors, createSelector } from '@ngxs/store';
import { TodoState, TodoStateModel } from './todo.state';

export class TodoSelectors {
  static getSlices = createPropertySelectors<TodoStateModel>(TodoState);
}

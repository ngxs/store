import { createPropertySelectors, createSelector } from '@ngxs/store';
import { TodoState, TodoStateModel } from './todo.state';

export class TodoSelectors {
  static getSlices = createPropertySelectors<TodoStateModel>(TodoState);

  static getCompletedTodos = createSelector([TodoSelectors.getSlices.todos], todos =>
    todos.filter(todo => todo.completed)
  );

  // static getIncompletedTodos = createSelector(
  //   [TodoSelectors.getSlices.todos],
  //   (todos) => todos.filter((todo) => !todo.completed),
  // );
}

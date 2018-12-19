import { NgxsConfig } from '@ngxs/store';
import { NgxsDevtoolsOptions } from '@ngxs/devtools-plugin';
import { NgxsLoggerPluginOptions } from '@ngxs/logger-plugin';

import { environment as env } from '@integration/env/environment';
import { TodosState } from '@integration/store/todos/todos.state';
import { TodoState } from '@integration/store/todos/todo/todo.state';

export const STATES_MODULES = [TodosState, TodoState];

export const OPTIONS_CONFIG: Partial<NgxsConfig> = {
  developmentMode: !env.production
};

export const DEVTOOLS_REDUX_CONFIG: NgxsDevtoolsOptions = {
  disabled: env.production
};

export const LOGGER_CONFIG: NgxsLoggerPluginOptions = {
  logger: console,
  collapsed: false
};

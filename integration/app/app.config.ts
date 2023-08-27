import { APP_ID } from '@angular/core';
import { provideRouter } from '@angular/router';
import { ApplicationConfig } from '@angular/platform-browser';
import { provideStore } from '@ngxs/store';
import { withNgxsFormPlugin } from '@ngxs/form-plugin';
import { withNgxsLoggerPlugin } from '@ngxs/logger-plugin';
import { withNgxsReduxDevtoolsPlugin } from '@ngxs/devtools-plugin';
import { withNgxsRouterPlugin } from '@ngxs/router-plugin';
import { withNgxsStoragePlugin } from '@ngxs/storage-plugin';

import { TodosState } from '@integration/store/todos/todos.state';
import { TodoState } from '@integration/store/todos/todo/todo.state';
import { TODOS_STORAGE_KEY } from '@integration/store/todos/todos.model';

import { environment } from '../environments/environment';

export const APP_ID_VALUE = 'integration-app';

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: APP_ID, useValue: APP_ID_VALUE },

    provideRouter([
      { path: '', pathMatch: 'full', redirectTo: '/list' },
      {
        path: 'list',
        loadChildren: () => import('@integration/list/list.module').then(m => m.ListModule)
      },
      {
        path: 'detail',
        loadChildren: () =>
          import('@integration/detail/detail.module').then(m => m.DetailModule)
      },
      {
        path: 'counter',
        loadChildren: () =>
          import('@integration/counter/counter.module').then(m => m.CounterModule)
      }
    ]),

    provideStore(
      [TodosState, TodoState],
      { developmentMode: !environment.production, selectorOptions: {} },
      withNgxsFormPlugin(),
      withNgxsLoggerPlugin({ logger: console, collapsed: false, disabled: true }),
      withNgxsReduxDevtoolsPlugin({ disabled: environment.production }),
      withNgxsRouterPlugin(),
      withNgxsStoragePlugin({ key: [TODOS_STORAGE_KEY] })
    )
  ]
};

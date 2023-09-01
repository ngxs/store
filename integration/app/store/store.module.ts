import { NgModule } from '@angular/core';
import { NgxsModule } from '@ngxs/store';
import { CommonModule } from '@angular/common';
import { NgxsFormPluginModule } from '@ngxs/form-plugin';
import { NgxsLoggerPluginModule } from '@ngxs/logger-plugin';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';
import { NgxsRouterPluginModule } from '@ngxs/router-plugin';
import { NgxsStoragePluginModule } from '@ngxs/storage-plugin';

import { TodosState } from '@integration/store/todos/todos.state';
import { TodoState } from '@integration/store/todos/todo/todo.state';
import { environment } from '../../environments/environment';
import { TODOS_STORAGE_KEY } from './todos/todos.model';

@NgModule({
  imports: [
    CommonModule,
    NgxsFormPluginModule.forRoot(),
    NgxsLoggerPluginModule.forRoot({ logger: console, collapsed: false }),
    NgxsReduxDevtoolsPluginModule.forRoot({ disabled: environment.production }),
    NgxsRouterPluginModule.forRoot(),
    NgxsStoragePluginModule.forRoot({ key: [TODOS_STORAGE_KEY] }),
    NgxsModule.forRoot([TodosState, TodoState], {
      developmentMode: !environment.production,
      selectorOptions: {} // empty object to test option merging
    })
  ],
  exports: [
    NgxsFormPluginModule,
    NgxsLoggerPluginModule,
    NgxsReduxDevtoolsPluginModule,
    NgxsModule
  ]
})
export class NgxsStoreModule {}

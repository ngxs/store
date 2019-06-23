import { NgModule } from '@angular/core';
import { NgxsModule } from '@ngxs/store';
import { CommonModule } from '@angular/common';
import { NgxsFormPluginModule } from '@ngxs/form-plugin';
import { NgxsLoggerPluginModule } from '@ngxs/logger-plugin';
import { NgxsStoragePluginModule } from '@ngxs/storage-plugin';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';

import { TodosState } from '@integration/store/todos/todos.state';
import { TodoState } from '@integration/store/todos/todo/todo.state';
import { environment as env } from '../../environments/environment';
import { TODOS_STORAGE_KEY } from '@integration/store/todos/todos.model';

@NgModule({
  imports: [
    CommonModule,
    NgxsFormPluginModule.forRoot(),
    NgxsLoggerPluginModule.forRoot({ logger: console, collapsed: false }),
    NgxsReduxDevtoolsPluginModule.forRoot({ disabled: env.production }),
    NgxsStoragePluginModule.forRoot({ key: [TODOS_STORAGE_KEY] }),
    // TODO: After upgrade @angular/router@8.*.* not working with SSR
    // Need fix RouterDataResolved for compatibility
    // NgxsRouterPluginModule.forRoot(),
    NgxsModule.forRoot([TodosState, TodoState], { developmentMode: !env.production })
  ],
  exports: [
    NgxsFormPluginModule,
    NgxsLoggerPluginModule,
    NgxsReduxDevtoolsPluginModule,
    NgxsModule
  ]
})
export class NgxsStoreModule {}

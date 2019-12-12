import { NgModule } from '@angular/core';
import { NgxsModule } from '@ngxs/store';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';
import { NgxsFormPluginModule } from '@ngxs/form-plugin';
import { NgxsLoggerPluginModule } from '@ngxs/logger-plugin';
import { NgxsStoragePluginModule } from '@ngxs/storage-plugin';
import { NgxsWebsocketPluginModule } from '@ngxs/websocket-plugin';
// import { NgxsRouterPluginModule } from '@ngxs/router-plugin';

import { CounterState } from './counter/counter.state';

@NgModule({
  imports: [
    NgxsModule.forRoot([CounterState]),
    NgxsReduxDevtoolsPluginModule.forRoot(),
    NgxsFormPluginModule.forRoot(),
    NgxsLoggerPluginModule.forRoot(),
    NgxsStoragePluginModule.forRoot(),
    NgxsWebsocketPluginModule.forRoot()
    // TODO: https://github.com/angular/angular/issues/34191
    // NgxsRouterPluginModule.forRoot()
  ]
})
export class StoreModule {}

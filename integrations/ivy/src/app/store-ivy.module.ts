import { NgModule } from '@angular/core';
import { NgxsModule } from '@ngxs/store';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';
import { NgxsFormPluginModule } from '@ngxs/form-plugin';
import { NgxsLoggerPluginModule } from '@ngxs/logger-plugin';
import { NgxsStoragePluginModule } from '@ngxs/storage-plugin';
import { NgxsWebsocketPluginModule } from '@ngxs/websocket-plugin';

import { AppState } from './app.state';

@NgModule({
  imports: [
    NgxsModule.forRoot([AppState]),
    NgxsReduxDevtoolsPluginModule.forRoot(),
    NgxsFormPluginModule.forRoot(),
    NgxsLoggerPluginModule.forRoot(),
    NgxsStoragePluginModule.forRoot(),
    NgxsWebsocketPluginModule.forRoot()
    // TODO(splincode): Ivy not working with NgxsRouterPluginModule
    // Build successful, but runtime error:
    // Can't resolve all parameters for RouterState: (?, ?, ?, ?, ?, ?, ?).
    // NgxsRouterPluginModule.forRoot()
  ],
  exports: [NgxsModule]
})
export class StoreIvyModule {}

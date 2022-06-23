import { NgModule } from '@angular/core';
import { NgxsModule } from '@ngxs/store';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';
import { NgxsFormPluginModule } from '@ngxs/form-plugin';
import { NgxsLoggerPluginModule } from '@ngxs/logger-plugin';
import { NgxsStoragePluginModule } from '@ngxs/storage-plugin';
import { NgxsWebsocketPluginModule } from '@ngxs/websocket-plugin';
import { NgxsRouterPluginModule } from '@ngxs/router-plugin';

import { CounterState } from './counter/counter.state';
import { environment } from '../../environments/environment';

@NgModule({
  imports: [
    NgxsModule.forRoot([CounterState]),
    NgxsReduxDevtoolsPluginModule.forRoot({ disabled: environment.production }),
    NgxsFormPluginModule.forRoot(),
    NgxsLoggerPluginModule.forRoot({ disabled: environment.production }),
    NgxsStoragePluginModule.forRoot(),
    NgxsWebsocketPluginModule.forRoot(),
    NgxsRouterPluginModule.forRoot()
  ]
})
export class StoreModule {}

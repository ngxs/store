import { NgModule } from '@angular/core';
import { NgxsModule } from '@ngxs/store';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';
import { NgxsFormPluginModule } from '@ngxs/form-plugin';
import { NgxsLoggerPluginModule } from '@ngxs/logger-plugin';
import { NgxsStoragePluginModule } from '@ngxs/storage-plugin';
import { NgxsWebsocketPluginModule } from '@ngxs/websocket-plugin';
import { NgxsRouterPluginModule } from '@ngxs/router-plugin';

import { AppState } from './app.state';
import { CounterEmitterState } from './couter-emitter.state';
import { NgxsEmitPluginModule } from '@ngxs-labs/emitter';
import { NgxsDispatchPluginModule } from '@ngxs-labs/dispatch-decorator';
import { CounterState } from './counter.state';
import { AnimalState } from './animal.state';

@NgModule({
  imports: [
    NgxsModule.forRoot([AppState, CounterEmitterState, CounterState, AnimalState]),
    // OFFICIAL NGXS packages
    NgxsReduxDevtoolsPluginModule.forRoot(),
    NgxsFormPluginModule.forRoot(),
    NgxsLoggerPluginModule.forRoot(),
    NgxsStoragePluginModule.forRoot(),
    NgxsWebsocketPluginModule.forRoot(),
    NgxsRouterPluginModule.forRoot(),
    // NGXS-LABS packages
    NgxsEmitPluginModule.forRoot(),
    NgxsDispatchPluginModule.forRoot()
  ],
  exports: [NgxsModule]
})
export class StoreModule {}

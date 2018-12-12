import { NgModule } from '@angular/core';
import { BrowserTransferStateModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxsStoragePluginModule } from '@ngxs/storage-plugin';
import { NgxsHmrPlugin, NgxsStoreSnapshot } from '@ngxs/hmr-plugin';
import { StateStream } from '@ngxs/store';

import { AppComponent } from './app.component';
import { AppModule } from './app.module';

@NgModule({
  bootstrap: [AppComponent],
  imports: [
    AppModule,
    BrowserAnimationsModule,
    BrowserTransferStateModule,
    NgxsStoragePluginModule.forRoot({
      key: ['todos.todo']
    })
  ],
  providers: [{ provide: 'ORIGIN_URL', useValue: location.origin }]
})
export class AppBrowserModule implements NgxsHmrPlugin {

  public hmrNgxsStoreOnInit(state: StateStream, snapshot: NgxsStoreSnapshot) {
    console.log('[NGXS HMR]: Current state', state.getValue());
    console.log('[NGXS HMR]: Previous state', snapshot);
    state.next({ ...state.getValue(), ...snapshot });
  }

  public hmrNgxsStoreOnDestroy(state: StateStream): NgxsStoreSnapshot  {
    console.log('[NGXS HMR]: Return the necessary HMR state for reuse...');
    return state.getValue();
  }

}

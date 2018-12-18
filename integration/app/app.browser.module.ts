import { NgModule } from '@angular/core';
import { StateContext } from '@ngxs/store';
import { BrowserTransferStateModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxsStoragePluginModule } from '@ngxs/storage-plugin';
import { NgxsHmrLifeCycle, NgxsStoreSnapshot } from '@ngxs/hmr-plugin';

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
export class AppBrowserModule implements NgxsHmrLifeCycle<NgxsStoreSnapshot> {
  public hmrNgxsStoreOnInit(ctx: StateContext<NgxsStoreSnapshot>, snapshot: NgxsStoreSnapshot) {
    console.log('[NGXS HMR] Current state', ctx.getState());
    console.log('[NGXS HMR] Previous state', snapshot);
    ctx.setState({ ...ctx.getState(), ...snapshot });
  }

  public hmrNgxsStoreBeforeOnDestroy(ctx: StateContext<NgxsStoreSnapshot>): NgxsStoreSnapshot {
    const snapshot: NgxsStoreSnapshot = ctx.getState();
    console.log('[NGXS HMR] Saved state before on destroy', snapshot);
    return snapshot;
  }
}

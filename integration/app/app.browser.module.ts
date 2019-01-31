import { NgModule } from '@angular/core';
import { StateContext } from '@ngxs/store';
import { BrowserTransferStateModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxsStoragePluginModule } from '@ngxs/storage-plugin';
import { NgxsHmrLifeCycle, NgxsHmrSnapshot as Snapshot } from '@ngxs/hmr-plugin';

import { AppComponent } from '@integration/app.component';
import { AppModule } from '@integration/app.module';
import { TODOS_STORAGE_KEY } from '@integration/store/todos/todos.model';

@NgModule({
  bootstrap: [AppComponent],
  imports: [
    AppModule,
    BrowserAnimationsModule,
    BrowserTransferStateModule,
    NgxsStoragePluginModule.forRoot({ key: [TODOS_STORAGE_KEY] })
  ],
  providers: [{ provide: 'ORIGIN_URL', useValue: location.origin }]
})
export class AppBrowserModule implements NgxsHmrLifeCycle<Snapshot> {
  public hmrNgxsStoreOnInit(ctx: StateContext<Snapshot>, snapshot: Partial<Snapshot>) {
    ctx.patchState(snapshot);
  }

  public hmrNgxsStoreBeforeOnDestroy(ctx: StateContext<Snapshot>): Partial<Snapshot> {
    return ctx.getState();
  }
}

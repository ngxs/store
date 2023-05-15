import { NgModule } from '@angular/core';
import { BrowserTransferStateModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxsStoragePluginModule } from '@ngxs/storage-plugin';

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
  ]
})
export class AppBrowserModule {}

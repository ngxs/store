import { NgModule } from '@angular/core';
import { BrowserTransferStateModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxsStoragePluginModule } from '@ngxs/storage-plugin';

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
export class AppBrowserModule {}

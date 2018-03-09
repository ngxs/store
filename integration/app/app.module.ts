import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { NgxsModule, LocalStoragePluginModule } from 'ngxs';
import { RouterModule } from '@angular/router';

import { TodoStore } from './todo.store';
import { AppComponent } from './app.component';
import { routes } from './app.routes';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes),
    NgxsModule.forRoot([TodoStore]),
    LocalStoragePluginModule.forRoot()
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}

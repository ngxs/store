import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { NgxsModule, ReduxDevtoolsPluginModule } from 'ngxs';
import { RouterModule } from '@angular/router';

import { TodoState } from './todo.state';
import { AppComponent } from './app.component';
import { routes } from './app.routes';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, RouterModule.forRoot(routes), NgxsModule.forRoot([TodoState]), ReduxDevtoolsPluginModule],
  bootstrap: [AppComponent]
})
export class AppModule {}

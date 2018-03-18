import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgxsModule, ReduxDevtoolsPluginModule } from 'ngxs';

import { environment } from '../environments/environment';
import { AppComponent } from './app.component';
import { routes } from './app.routes';
import { states } from './app.state';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes),
    NgxsModule.forRoot(states),
    ReduxDevtoolsPluginModule.forRoot({
      disabled: environment.production
    })
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}

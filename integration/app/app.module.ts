import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgxsModule, NgxsReduxDevtoolsPluginModule } from '@ngxs/store';

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
    NgxsReduxDevtoolsPluginModule.forRoot({
      disabled: environment.production
    })
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}

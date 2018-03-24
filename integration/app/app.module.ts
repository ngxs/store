import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgxsModule, NgxsReduxDevtoolsPluginModule, NgxsLoggerPluginModule,
  NgxsFormPluginModule } from 'ngxs';

import { environment } from '../environments/environment';
import { AppComponent } from './app.component';
import { routes } from './app.routes';
import { states } from './app.state';

@NgModule({
  declarations: [AppComponent],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    BrowserModule,
    RouterModule.forRoot(routes),
    NgxsModule.forRoot(states),
    NgxsReduxDevtoolsPluginModule.forRoot({
      disabled: environment.production
    }),
    NgxsFormPluginModule.forRoot(),
    NgxsLoggerPluginModule.forRoot({ logger: console, collapsed: false }),
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxsModule } from '@ngxs/store';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';
import { NgxsFormPluginModule } from '@ngxs/form-plugin';
import { NgxsLoggerPluginModule } from '@ngxs/logger-plugin';

import { environment as env } from '../environments/environment';
import { AppComponent } from './app.component';
import { routes } from './app.routes';
import { states } from './app.state';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule.withServerTransition({ appId: 'my-app' }),
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forRoot(routes),
    NgxsFormPluginModule.forRoot(),
    NgxsModule.forRoot(states, { developmentMode: !env.production }),
    NgxsLoggerPluginModule.forRoot({ logger: console, collapsed: false }),
    NgxsReduxDevtoolsPluginModule.forRoot({ disabled: env.production })
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}

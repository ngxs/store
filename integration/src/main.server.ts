import { bootstrapApplication, BootstrapContext } from '@angular/platform-browser';

import { AppComponent } from './app/app.component';
import { appServerConfig } from './app/app.config.server';

const bootstrap = (context: BootstrapContext) =>
  bootstrapApplication(AppComponent, appServerConfig, context);

export default bootstrap;

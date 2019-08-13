import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import {
  hmr,
  WebpackHotApi,
  WebpackModule,
  BootstrapModuleFn as Bootstrap
} from '@ngxs/hmr-plugin';

import { AppBrowserModule } from './app/app.browser.module';
import { environment } from './environments/environment';

declare const module: WebpackModule;

if (environment.production) {
  enableProdMode();
}

const bootstrap: Bootstrap = () => platformBrowserDynamic().bootstrapModule(AppBrowserModule);

if (environment.hmr) {
  hmr(module, bootstrap, {
    autoClearLogs: false,
    dispose(api: WebpackHotApi): void {
      console.log('[HMR API]', api);
    }
  }).catch((err: Error) => console.error(err));
} else {
  bootstrap().catch(err => console.log(err));
}

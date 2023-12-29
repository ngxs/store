import 'zone.js/node';

import { readFile } from 'fs/promises';
import { join } from 'path';
import * as express from 'express';
import { Provider } from '@angular/core';
import { APP_BASE_HREF } from '@angular/common';
import { renderApplication } from '@angular/platform-server';
import { REQUEST, RESPONSE } from '@nguniversal/express-engine/tokens';

import { APP_ID_VALUE, AppComponent, appServerConfig } from './main.server';

interface RenderOptions {
  req: express.Request;
  providers: Provider[];
}

// The Express app is exported so that it can be used by serverless Functions.
export function app() {
  const server = express();
  const distFolder = join(process.cwd(), 'dist-integration');
  let indexHtmlContent: string | null = null;

  // TODO: use `ngExpressEngine({bootstrap})` in v16.
  server.engine(
    'html',
    async (
      path: string,
      options: object,
      callback: (error: Error | null, content: string) => void
    ) => {
      const { req, providers } = options as RenderOptions;

      indexHtmlContent ||= await readFile(path, { encoding: 'utf-8' });

      const html = await renderApplication(AppComponent, {
        providers,
        appId: APP_ID_VALUE,
        document: indexHtmlContent,
        url: `${req.baseUrl}${req.url}`
      });

      callback(null, html);
    }
  );

  server.set('view engine', 'html');
  server.set('views', distFolder);

  // Example Express Rest API endpoints
  // app.get('/api/**', (req, res) => { });
  // Serve static files from /browser
  server.get(
    '*.*',
    express.static(distFolder, {
      maxAge: '1y'
    })
  );

  // All regular routes use the Universal engine
  server.get('*', (req, res) => {
    res.render('index', {
      req,
      providers: [
        ...appServerConfig.providers,
        { provide: APP_BASE_HREF, useValue: req.baseUrl },
        { provide: REQUEST, useValue: req },
        { provide: RESPONSE, useValue: res }
      ]
    });
  });

  return server;
}

function run() {
  const port = process.env.PORT || 4200;

  // Start up the Node server
  const server = app();
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

// Webpack will replace 'require' with '__webpack_require__'
// '__non_webpack_require__' is a proxy to Node 'require'
// The below code is to ensure that the server is run only when not requiring the bundle.
// eslint-disable-next-line
declare const __non_webpack_require__: NodeRequire;
// eslint-disable-next-line
const mainModule = __non_webpack_require__.main;
const moduleFilename = (mainModule && mainModule.filename) || '';
if (moduleFilename === __filename || moduleFilename.includes('iisnode')) {
  run();
}

export * from './main.server';

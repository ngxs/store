import 'zone.js/node';

import * as path from 'node:path';
import * as url from 'node:url';
import * as express from 'express';
import { APP_BASE_HREF } from '@angular/common';

import { CommonEngine } from '@angular/ssr';

import bootstrap from './main.server';

// The Express app is exported so that it can be used by serverless Functions.
export function app() {
  const server = express();
  const browserDistFolder = path.join(process.cwd(), 'dist-integration');
  const indexHtml = path.join(browserDistFolder, 'index.html');
  const commonEngine = new CommonEngine();

  server.set('view engine', 'html');
  server.set('views', browserDistFolder);

  // Example Express Rest API endpoints
  // app.get('/api/**', (req, res) => { });
  // Serve static files from /browser
  server.get(
    '*.*',
    express.static(browserDistFolder, {
      maxAge: '1y'
    })
  );

  // All regular routes use the Universal engine
  server.get('*', (req, res, next) => {
    const { protocol, originalUrl, baseUrl, headers } = req;

    commonEngine
      .render({
        bootstrap,
        documentFilePath: indexHtml,
        url: `${protocol}://${headers.host}${originalUrl}`,
        publicPath: browserDistFolder,
        providers: [{ provide: APP_BASE_HREF, useValue: req.baseUrl }]
      })
      .then(html => res.send(html))
      .catch(next);
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

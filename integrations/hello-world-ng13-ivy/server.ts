import 'zone.js/dist/zone-node';

import { APP_BASE_HREF } from '@angular/common';
import { ngExpressEngine } from '@nguniversal/express-engine';
import { REQUEST, RESPONSE } from '@nguniversal/express-engine/tokens';
import * as express from 'express';
import { join } from 'path';

import { AppServerModule } from './src/main.server';

export function app() {
  const server = express();
  const distFolder = join(process.cwd(), 'dist-integration');

  server.engine(
    'html',
    ngExpressEngine({
      bootstrap: AppServerModule
    }) as any
  );

  server.set('view engine', 'html');
  server.set('views', distFolder);

  server.get(
    '*.*',
    express.static(distFolder, {
      maxAge: '1y'
    })
  );

  server.get('*', (req, res) => {
    res.render('index', {
      req,
      providers: [
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

export * from './src/main.server';

import 'zone.js/dist/zone-node';
import 'reflect-metadata';

const fs = require('fs');
const path = require('path');
const files: string[] = fs.readdirSync(`./../dist-integration-server`);

import { enableProdMode } from '@angular/core';
import * as express from 'express';
const { provideModuleMap } = require('@nguniversal/module-map-ngfactory-loader');

const mainFiles = files.filter(file => file.startsWith('main'));
const hash = mainFiles[0].split('.')[1];
const {
  AppServerModuleNgFactory,
  LAZY_MODULE_MAP
} = require(`./../dist-integration-server/main.${hash}`);
import { ngExpressEngine } from '@nguniversal/express-engine';
import { exit } from 'process';
const PORT = process.env.PORT || 4000;

enableProdMode();

const app = express();
app.use((req, res, next) => {
  console.log(req.url);
  if (req.url === '/robots.txt') {
    return;
  }

  if (req.url === '/integration/favicon.ico') {
    return;
  }

  if (req.url === '/test/exit') {
    res.send('exit');
    exit(0);
    return;
  }
  next();
});

app.engine(
  'html',
  ngExpressEngine({
    bootstrap: AppServerModuleNgFactory,
    providers: [provideModuleMap(LAZY_MODULE_MAP)]
  })
);

app.set('view engine', 'html');
app.set('views', '.');

app.get('*.*', express.static(path.join(__dirname, '..', 'dist-integration')));

app.get('*', (req, res) => {
  const http =
    req.headers['x-forwarded-proto'] === undefined ? 'http' : req.headers['x-forwarded-proto'];

  const url = req.originalUrl;
  // tslint:disable-next-line:no-console
  console.time(`GET: ${url}`);
  res.render(
    '../dist-integration/index',
    {
      req: req,
      res: res,
      providers: [
        {
          provide: 'ORIGIN_URL',
          useValue: `${http}://${req.headers.host}`
        }
      ]
    },
    (err, html) => {
      if (!!err) {
        throw err;
      }

      // tslint:disable-next-line:no-console
      console.timeEnd(`GET: ${url}`);
      res.send(html);
    }
  );
});

app.listen(PORT, () => {
  console.log(`listening on http://localhost:${PORT}!`);
});

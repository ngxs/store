import 'zone.js/dist/zone-node';
import 'reflect-metadata';

import { join } from 'path';
import { readFileSync } from 'fs';
import * as express from 'express';

import { enableProdMode } from '@angular/core';
import { renderModuleFactory } from '@angular/platform-server';
import { provideModuleMap } from '@nguniversal/module-map-ngfactory-loader';

const {
  AppServerModuleNgFactory,
  LAZY_MODULE_MAP
} = require('../dist-integration-server/main');

const PORT = process.env.PORT || 4200;
const DIST_FOLDER = join(__dirname, '../dist-integration');

enableProdMode();

const app = express();
// Read `index.html` only once and cache it
const document = readFileSync(join(DIST_FOLDER, 'index.html')).toString();

app.use(express.static(DIST_FOLDER));
app.use('/favicon.ico', express.static(join(DIST_FOLDER, 'favicon.ico')));

app.get('*', (req, res) => {
  const url = req.url;
  // tslint:disable-next-line:no-console
  console.time(`GET: ${url}`);

  renderModuleFactory(AppServerModuleNgFactory, {
    url,
    document,
    extraProviders: [provideModuleMap(LAZY_MODULE_MAP)]
  }).then(html => {
    // tslint:disable-next-line:no-console
    console.timeEnd(`GET: ${url}`);
    res.send(html);
  });
});

app.listen(PORT, () => {
  console.log(`Express server is running and listening at http://localhost:${PORT}!`);
});

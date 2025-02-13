import fs from 'node:fs';
import url from 'node:url';
import path from 'node:path';

import { packages } from './packages.mjs';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const licensePath = path.join(__dirname, '../LICENSE');

for (const package$ of packages) {
  const destinationPath = path.join(__dirname, '../@ngxs', package$, 'LICENSE');
  fs.copyFileSync(licensePath, destinationPath);
  console.log(`Copied LICENSE in ${destinationPath}.`);
}

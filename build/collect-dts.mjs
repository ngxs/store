import glob from 'glob';
import * as url from 'node:url';
import * as path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

const packages = [
  'store',
  'devtools-plugin',
  'form-plugin',
  'logger-plugin',
  'router-plugin',
  'storage-plugin',
  'websocket-plugin'
];

export function getEntryPointsAndDtsToRemove() {
  const entryPoints = [];
  const dtsToRemove = [];

  for (const package$ of packages) {
    const packageJson = require(`../@ngxs/${package$}/package.json`);

    // Gather all `.d.ts` entry points for a single package, such as
    // `@ngxs/store`, which includes `@ngxs/store/internals` and others.
    entryPoints.push(
      ...Object.values(packageJson.exports)
        .map(export$ => export$.types)
        .filter(types => !!types)
        .map(types => path.resolve(__dirname, `../@ngxs/${package$}`, types))
    );

    dtsToRemove.push(
      ...glob.sync(path.join(__dirname, `../@ngxs/${package$}/**/*.d.ts`)).filter(
        file =>
          // We need to remove all declaration files except for the
          // `index.d.ts` entry points.
          entryPoints.indexOf(file) === -1
      )
    );
  }

  return { entryPoints, dtsToRemove };
}

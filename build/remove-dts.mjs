import * as fs from 'node:fs';

import { getEntryPointsAndDtsToRemove } from './collect-dts.mjs';

console.log('Preparing to remove unnecessary `.d.ts` files now that we have flattened them.');

for (const dts of getEntryPointsAndDtsToRemove().dtsToRemove) {
  fs.unlinkSync(dts);
}

console.log('Successfully removed unnecessary `.d.ts` files.');

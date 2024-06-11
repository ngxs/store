import { dts } from 'rollup-plugin-dts';

import { getEntryPointsAndDtsToRemove } from './build/collect-dts.mjs';

export default getEntryPointsAndDtsToRemove().entryPoints.map(entryPoint => ({
  input: entryPoint,
  output: [{ file: entryPoint, format: 'es' }],
  plugins: [dts()]
}));

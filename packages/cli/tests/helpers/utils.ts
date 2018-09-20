import { CliArgvImpl, GeneratorResults } from '@ngxs/cli/tests/helpers/config';
import * as nodePlopGenerator from '@ngxs/cli/src/node-generator';
import { rimraf } from 'ng-packagr/lib/util/rimraf';

declare const __dirname: any;
declare const require: any;

const fs = require('fs');
const path = require('path');

export async function execCli(argv: Partial<CliArgvImpl>): Promise<GeneratorResults> {
  const plopfilePath = path.resolve(__dirname, '../../plopfile.js');
  return nodePlopGenerator({ plopfilePath, argv, showOutput: false });
}

export function readFile(relativePath: string) {
  return fs.readFileSync(path.resolve(relativePath)).toString();
}

export function removeDirectory(relativePath: string) {
  rimraf(path.resolve(relativePath), () => {
    console.log('[DONE]');
  });
}

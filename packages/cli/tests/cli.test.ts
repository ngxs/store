import { cliArgv, expectedFiles, generatedFiles, GeneratorResults } from '@ngxs/cli/tests/helpers/config';
import { execCli, readFile, removeDirectory } from '@ngxs/cli/tests/helpers/utils';
import { expect } from 'chai';
import 'mocha';

describe('NgxsCli', () => {
  let cliOutput: GeneratorResults = null;

  before(async () => (cliOutput = await execCli(cliArgv)));

  it('Check that abortOnFail:false', async () => {
    const abortOnFail: boolean = Boolean(cliOutput.failures.length);
    expect(abortOnFail).to.equal(false);
  });

  it('Check correctly generated template app.actions.ts', () => {
    expect(readFile(expectedFiles.actions)).to.equal(readFile(generatedFiles.actions));
  });

  it('Check correctly generated template app.state.ts', () => {
    expect(readFile(expectedFiles.state)).to.equal(readFile(generatedFiles.state));
  });

  it('Check correctly generated template app.state.spec.ts', () => {
    expect(readFile(expectedFiles.spec)).to.equal(readFile(generatedFiles.spec));
  });

  after(() => removeDirectory(cliArgv.directory));
});

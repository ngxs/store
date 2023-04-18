const { execSync } = require('child_process');
const { readdirSync, existsSync, mkdirSync } = require('fs');
const { join } = require('path');
const yargs = require('yargs');

const { reporterBinaryPath, coverageDir } = yargs(process.argv).argv;

if (!reporterBinaryPath || !coverageDir) {
  throw new Error(`"reporterBinaryPath" and "coverageDir" are required.`);
}

const reportSources = readdirSync(coverageDir);

if (!reportSources) {
  throw new Error(`Provided directory "${coverageDir}" does not contain any reports.`);
}

if (existsSync('tmp')) {
  mkdirSync('tmp');
}

for (const source of reportSources) {
  const formatCommand = `${reporterBinaryPath} format-coverage -t lcov -o tmp/codeclimate.${source}.json ${join(
    coverageDir,
    source,
    'lcov.info'
  )}`;
  console.log(`Format report: "${formatCommand}"`);
  execSync(formatCommand, { stdio: [0, 1, 2] });
}

const sumCommand = `${reporterBinaryPath} sum-coverage tmp/codeclimate.*.json -o tmp/codeclimate-final.json`;
console.log(`Sum coverage: "${sumCommand}"`);
execSync(sumCommand, { stdio: [0, 1, 2] });

#!/usr/bin/env node

const commandLineArgs = require('command-line-args');
const helpOutline = require('./src/command-line-helpers/help-outline');
const optionDefinitions = require('./src/command-line-helpers/option-definition');
const nodePlopPath = require('./src/command-line-helpers/normalize-plop-path');
const nodePlopGenerator = require('./src/node-generator');

const argv = commandLineArgs(optionDefinitions, { camelCase: true, stopAtFirstUnknown: true });
const { help, plopfile, name } = argv;

const HELP_MODE = !!help;
const CUSTOM_GENERATOR_MODE = !!plopfile;
const COMMAND_LINE_GENERATE_MODE = !!name;
const UNKNOWN_COMMAND = argv['_unknown'] || null;

if (HELP_MODE || UNKNOWN_COMMAND) {
  helpOutline(UNKNOWN_COMMAND);
} else if (CUSTOM_GENERATOR_MODE) {
  nodePlopPath([plopfile], () => require('plop'));
} else {
  const plopfilePath = nodePlopPath([__dirname, 'plopfile.js']);

  if (COMMAND_LINE_GENERATE_MODE) {
    nodePlopGenerator({ plopfilePath, argv, showOutput: true });
  } else {
    require('plop');
  }
}

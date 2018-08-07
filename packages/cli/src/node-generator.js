const nodePlop = require('node-plop');
const colors = require('colors/safe');
const defaultGeneratorName = 'ngxs-cli';
const defaultUsageSpec = true;

module.exports = async function ({ plopfilePath, argv = {}, showOutput = true }) {
  const { spec } = argv;
  const plop = nodePlop(plopfilePath);
  const generator = plop.getGenerator(defaultGeneratorName);

  const cliArgv = { directory: '.', ...argv, spec:  (spec ? JSON.parse(spec) : defaultUsageSpec) };
  const result = await generator.runActions(cliArgv);

  if (showOutput) {
    const { changes, failures } = result;
    changes.forEach((item) => console.log(colors.green('[SUCCESS]'), item.type, item.path));
    failures.forEach((item) => console.log(colors.red('[FAILED]'), item.type, item.error));
  }

  return result;
};

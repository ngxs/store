const commandLineUsage = require('command-line-usage');
const colors = require('colors/safe');
const header = require('./ansi-header');
const showUnknownSection = (unknown) => (unknown ? {
  header: colors.red('Unknown command, see help information'),
  content: unknown
} : {});

module.exports = function (unknown = null) {
  const sections = [
    {
      content: colors.cyan(header),
      raw: true
    },
    showUnknownSection(unknown),
    {
      header: 'NGXS CLI',
      content: [
        '$ ngxs {bold --name} {underline name} {bold --spec} {underline boolean} {bold --directory} {underline path} {bold --folder-name} {underline name}',
        '$ ngxs {bold --help}'
      ]
    },
    {
      header: 'Options',
      optionList: [
        {
          name: colors.cyan('name'),
          typeLabel: '{underline name}',
          description: 'Store name'
        },
        {
          name: colors.cyan('directory'),
          typeLabel: '{underline path}',
          description: 'By default, the prompt is set to the current directory'
        },
        {
          name: colors.cyan('folder-name'),
          typeLabel: '{underline name}',
          description: 'Use your own folder name, default: state'
        },
        {
          name: colors.cyan('spec'),
          typeLabel: '{underline boolean}',
          description: 'Creates a spec file for store, default: true'
        }
      ]
    },
    {
      header: 'Custom template generator',
      content: [
        '$ ngxs {bold --plopfile} {underline path}'
      ]
    }
  ];
  const usage = commandLineUsage(sections);
  console.log(usage);
  process.exit();
};

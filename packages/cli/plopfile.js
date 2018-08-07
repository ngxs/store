const promptDirectory = require('inquirer-directory');
const commandLineArgs = require('command-line-args');
const optionDefinitions = require('./src/command-line-helpers/option-definition');
const options = commandLineArgs(optionDefinitions, { partial: true, camelCase: true });
const { folderName = 'state' } = options;

module.exports = function(plop) {
  plop.setPrompt('directory', promptDirectory);

  plop.setGenerator('ngxs-cli', {
    description: 'Create new store',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Store name:'
      },
      {
        type: 'directory',
        name: 'directory',
        message: 'Directory:',
        basePath: process.cwd()
      },
      {
        type: 'confirm',
        default: false,
        name: 'spec',
        message: 'Add spec for state?'
      }
    ],
    actions: data => {
      const { spec, directory } = data;
      const actions = [
        addFileByTpl({ directory, folderName, file: 'state' }),
        addFileByTpl({ directory, folderName, file: 'actions' })
      ];

      if (spec) {
        actions.push(addFileByTpl({ directory, folderName, file: 'state.spec' }));
      }

      return actions;
    }
  });
};

function addFileByTpl({ directory, folderName, file }) {
  const templateFile = `./src/templates/${file}.tpl`;
  const typescriptFile = `{{\'dashCase\' name}}.${file}.ts`;
  const path = `${process.cwd()}/${directory}/${folderName}/${typescriptFile}`;
  return { type: 'add', skipIfExists: true, path, templateFile };
}

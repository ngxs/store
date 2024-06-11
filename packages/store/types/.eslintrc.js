const path = require('node:path');

/** @type {import("@types/eslint").Linter.Config} */
module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: [path.join(__dirname, 'tsconfig.json')],
    ecmaVersion: 2022,
    sourceType: 'module'
  },
  extends: ['plugin:expect-type/recommended'],
  plugins: ['eslint-plugin-expect-type'],
  overrides: [
    {
      files: ['*.ts'],
      rules: {
        'prefer-const': 'off'
      }
    }
  ]
};

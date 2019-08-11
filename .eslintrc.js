/**
 * @type {import('eslint').Linter.Config}
 */
module.exports = {
  parser: '@typescript-eslint/parser',
  extends:  [
    'plugin:@typescript-eslint/recommended'
  ],
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    project: './tsconfig.lib.json',
    errorOnUnknownASTType: true,
    errorOnTypeScriptSyntacticAndSemanticIssues: true
  },
  rules: {
    '@typescript-eslint/indent': 'off',
    '@typescript-eslint/no-namespace': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/member-delimiter-style': 'off',
    '@typescript-eslint/no-parameter-properties': 'off',
    '@typescript-eslint/explicit-member-accessibility': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-angle-bracket-type-assertion': 'off',
    '@typescript-eslint/no-object-literal-type-assertion': 'off'
  }
};

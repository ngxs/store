module.exports = {
  env: {
    browser: true,
    node: true
  },
  extends: [],
  ignorePatterns: [
    '**/*.spec.ts',
    '**/*.lint.ts',
    '**/@ngxs/**',
    '**/cypress/**',
    '**/dist/**',
    '**/node_modules/**',
    '**/coverage/**',
    '**/docs/**'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    sourceType: 'module',
    createDefaultProgram: true,
    errorOnUnknownASTType: true,
    errorOnTypeScriptSyntacticAndSemanticIssues: true
  },
  plugins: ['@typescript-eslint/eslint-plugin', '@typescript-eslint/tslint', 'prettier'],
  rules: {
    '@typescript-eslint/class-name-casing': 'error',
    '@typescript-eslint/explicit-member-accessibility': [
      'off',
      {
        accessibility: 'explicit'
      }
    ],
    indent: 'off',
    '@typescript-eslint/indent': 'off',
    '@typescript-eslint/member-delimiter-style': [
      'error',
      {
        multiline: { delimiter: 'semi', requireLast: true },
        singleline: { delimiter: 'semi', requireLast: false }
      }
    ],
    '@typescript-eslint/member-ordering': [
      'error',
      {
        default: [
          // Index signature
          'signature',

          // Fields
          'public-static-field',
          'protected-static-field',
          'private-static-field',
          'public-instance-field',
          'public-abstract-field',
          'protected-instance-field',
          'protected-abstract-field',
          'private-instance-field',
          'private-abstract-field',

          // Constructors
          'public-constructor',
          'protected-constructor',
          'private-constructor',

          // Methods
          'public-static-method',
          'protected-static-method',
          'private-static-method',
          'public-instance-method',
          'public-abstract-method',
          'protected-instance-method',
          'protected-abstract-method',
          'private-instance-method',
          'private-abstract-method'
        ]
      }
    ],
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/no-inferrable-types': 'off',
    '@typescript-eslint/no-misused-new': 'error',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    '@typescript-eslint/prefer-function-type': 'error',
    '@typescript-eslint/quotes': ['error', 'single', { allowTemplateLiterals: true }],
    '@typescript-eslint/semi': ['error', 'always'],
    '@typescript-eslint/type-annotation-spacing': 'error',
    '@typescript-eslint/unified-signatures': 'off',
    'brace-style': ['error', '1tbs'],
    camelcase: 'off',
    'constructor-super': 'error',
    'dot-notation': 'off',
    'eol-last': 'error',
    eqeqeq: ['error', 'smart'],
    'id-blacklist': 'off',
    'id-match': 'off',
    'max-len': [
      'error',
      {
        code: 95,
        ignoreTemplateLiterals: true,
        ignoreRegExpLiterals: true,
        ignoreStrings: true,
        ignoreComments: true
      }
    ],
    'no-bitwise': 'error',
    'no-caller': 'error',
    'no-console': [
      'error',
      {
        allow: [
          'log',
          'warn',
          'dir',
          'timeLog',
          'assert',
          'clear',
          'count',
          'countReset',
          'group',
          'groupEnd',
          'table',
          'dirxml',
          'error',
          'groupCollapsed',
          'Console',
          'profile',
          'profileEnd',
          'timeStamp',
          'context'
        ]
      }
    ],
    'no-debugger': 'error',
    'no-empty': 'off',
    'no-eval': 'error',
    'no-fallthrough': 'error',
    'no-new-wrappers': 'error',
    'no-shadow': ['error', { hoist: 'all' }],
    'no-throw-literal': 'error',
    'no-trailing-spaces': 'error',
    'no-undef-init': 'error',
    'no-underscore-dangle': 'off',
    'no-unused-labels': 'error',
    'no-var': 'error',
    'prefer-const': 'error',
    radix: 'error',
    'spaced-comment': ['error', 'always', { markers: ['/'] }],
    '@typescript-eslint/tslint/config': [
      'error',
      {
        rules: {
          'import-spacing': true,
          whitespace: [
            true,
            'check-branch',
            'check-decl',
            'check-operator',
            'check-separator',
            'check-type'
          ]
        }
      }
    ]
  }
};

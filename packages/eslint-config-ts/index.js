module.exports = {
  root: true,
  extends: [
    '@guanghechen',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  plugins: ['@typescript-eslint'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    project: './tsconfig.json',

    // @typescript-eslint/parser specific options
    warnOnUnsupportedTypeScriptVersion: true,
    allowImportExportEverywhere: true,
  },
  rules: {
    'default-case': 0, // TypeScript's `noFallthroughCasesInSwitch` option is more robust (#6906)
    'no-array-constructor': 0,
    'no-dupe-class-members': 0, // 'tsc' already handles this (https://github.com/typescript-eslint/typescript-eslint/issues/291)
    'no-redeclare': 0,
    'no-undef': 0, // 'tsc' already handles this (https://github.com/typescript-eslint/typescript-eslint/issues/477)
    'no-unused-expressions': 0,
    'no-unused-vars': 0,
    'no-use-before-define': 0,
    'no-useless-constructor': 0,
    '@typescript-eslint/array-type': [
      2,
      {
        default: 'array-simple',
        readonly: 'generic',
      },
    ],
    '@typescript-eslint/class-literal-property-style': [2, 'fields'],
    '@typescript-eslint/consistent-indexed-object-style': [2, 'record'],
    '@typescript-eslint/consistent-type-assertions': [
      2,
      {
        assertionStyle: 'as',
        objectLiteralTypeAssertions: 'allow-as-parameter',
      },
    ],
    '@typescript-eslint/consistent-type-definitions': 1,
    '@typescript-eslint/consistent-type-imports': [
      2,
      {
        prefer: 'type-imports',
        disallowTypeAnnotations: true,
      },
    ],
    '@typescript-eslint/explicit-function-return-type': [
      2,
      {
        allowExpressions: true,
        allowTypedFunctionExpressions: true,
        allowHigherOrderFunctions: false,
        allowDirectConstAssertionInArrowFunctions: true,
        allowConciseArrowFunctionExpressionsStartingWithVoid: true,
      },
    ],
    '@typescript-eslint/explicit-member-accessibility': [
      2,
      {
        accessibility: 'explicit',
        overrides: {
          accessors: 'explicit',
          constructors: 'no-public',
          methods: 'explicit',
          properties: 'explicit',
          parameterProperties: 'no-public',
        },
      },
    ],
    '@typescript-eslint/member-delimiter-style': [
      2,
      {
        multiline: {
          delimiter: 'none',
          requireLast: false,
        },
        singleline: {
          delimiter: 'comma',
          requireLast: true,
        },
      },
    ],
    '@typescript-eslint/method-signature-style': [2, 'method'],
    '@typescript-eslint/no-array-constructor': 1,
    '@typescript-eslint/no-confusing-non-null-assertion': 2,
    '@typescript-eslint/no-confusing-void-expression': [
      2,
      {
        ignoreArrowShorthand: true,
        ignoreVoidOperator: true,
      },
    ],
    '@typescript-eslint/no-dynamic-delete': 2,
    '@typescript-eslint/no-empty-function': 0,
    '@typescript-eslint/no-empty-interface': [
      2,
      {
        allowSingleExtends: false,
      },
    ],
    '@typescript-eslint/no-explicit-any': 0,
    '@typescript-eslint/no-floating-promises': 2,
    '@typescript-eslint/no-misused-promises': [
      2,
      {
        checksConditionals: true,
        checksVoidReturn: true,
      },
    ],
    '@typescript-eslint/no-non-null-assertion': 0,
    '@typescript-eslint/no-redeclare': [
      1,
      {
        ignoreDeclarationMerge: true,
      },
    ],
    '@typescript-eslint/no-this-alias': [
      2,
      {
        allowDestructuring: true, // Allow `const { props, state } = this`; false by default
        allowedNames: ['self'], // Allow `const self = this`; `[]` by default
      },
    ],
    '@typescript-eslint/no-empty-interface': 1,
    '@typescript-eslint/no-use-before-define': [
      1,
      {
        functions: false,
        classes: false,
        variables: false,
        typedefs: false,
      },
    ],
    '@typescript-eslint/no-unnecessary-qualifier': 2,
    '@typescript-eslint/no-unnecessary-type-arguments': 2,
    '@typescript-eslint/no-unused-expressions': [
      2,
      {
        allowShortCircuit: true,
        allowTernary: true,
        allowTaggedTemplates: true,
      },
    ],
    '@typescript-eslint/no-unused-vars': [
      1,
      {
        args: 'none',
        ignoreRestSiblings: true,
      },
    ],
    '@typescript-eslint/no-useless-constructor': 1,
    '@typescript-eslint/prefer-as-const': 2,
    '@typescript-eslint/prefer-enum-initializers': 2,
    '@typescript-eslint/space-before-function-paren': [
      2,
      {
        named: 'never',
        anonymous: 'always',
        asyncArrow: 'always',
      },
    ],
    '@typescript-eslint/type-annotation-spacing': [
      2,
      {
        before: false,
        after: true,
        overrides: {
          arrow: { before: true, after: true },
        },
      },
    ],
    '@typescript-eslint/unified-signatures': 2,
  },
}

const { jsxRules } = require('./rules/create-react-app')

module.exports = {
  root: true,
  extends: ['@guanghechen', 'plugin:react/recommended'],
  plugins: ['import', 'jsx-a11y', 'react', 'react-hooks'],
  parser: '@babel/eslint-parser',
  settings: {
    react: {
      version: 'detect',
    },
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    ecmaFeatures: {
      globalReturn: false,
      impliedStrict: true,
      jsx: true,
    },

    // @babel/eslint-parser specific options
    requireConfigFile: false,
    allowImportExportEverywhere: true,

    babelOptions: {
      plugins: ['@babel/plugin-syntax-import-assertions'],
    },
  },
  rules: {
    ...jsxRules,
    'react/display-name': 2,
    'react/jsx-boolean-value': [2, 'always'],
    'react/jsx-closing-bracket-location': [
      2,
      {
        nonEmpty: 'tag-aligned',
        selfClosing: 'line-aligned',
      },
    ],
    'react/jsx-curly-newline': [
      2,
      {
        multiline: 'consistent',
        singleline: 'consistent',
      },
    ],
    'react/jsx-curly-spacing': [
      2,
      {
        when: 'always',
        children: true,
        allowMultiline: true,
        spacing: {
          objectLiterals: 'never',
        },
      },
    ],
    'react/jsx-equals-spacing': [2, 'never'],
    'react/jsx-filename-extension': [
      2,
      {
        extensions: ['.jsx', '.tsx', '.js', '.ts'],
      },
    ],
    'react/jsx-first-prop-new-line': [2, 'multiline-multiprop'],
    'react/jsx-fragments': [2, 'element'],
    'react/jsx-indent-props': [2, 2],
    'react/jsx-indent': [
      2,
      2,
      {
        checkAttributes: true,
        indentLogicalExpressions: true,
      },
    ],
    'react/jsx-max-props-per-line': [
      2,
      {
        maximum: 1,
        when: 'multiline',
      },
    ],
    'react/jsx-no-bind': [
      2,
      {
        ignoreDOMComponents: false,
        ignoreRefs: false,
        allowArrowFunctions: true,
        allowFunctions: false,
        allowBind: false,
      },
    ],
    'react/jsx-no-duplicate-props': [
      2,
      {
        ignoreCase: true,
      },
    ],
    'react/jsx-props-no-multi-spaces': 2,
    'react/jsx-pascal-case': 2,
    'react/jsx-tag-spacing': [
      2,
      {
        closingSlash: 'never',
        beforeSelfClosing: 'always',
        afterOpening: 'never',
        beforeClosing: 'never',
      },
    ],
    'react/jsx-uses-vars': 1,
    'react/jsx-uses-react': 1,
    'react/jsx-wrap-multilines': [
      2,
      {
        declaration: 'parens-new-line',
        assignment: 'parens-new-line',
        return: 'parens-new-line',
        arrow: 'parens-new-line',
        condition: 'parens',
        logical: 'parens',
        prop: 'ignore',
      },
    ],
    'react/self-closing-comp': 2,
  },
}

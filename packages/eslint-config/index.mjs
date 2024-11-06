import eslint from '@eslint/js'
import stylisticTsPlugin from '@stylistic/eslint-plugin-ts'
import importPlugin from 'eslint-plugin-import'
import jestPlugin from 'eslint-plugin-jest'
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y'
import prettierPlugin from 'eslint-plugin-prettier/recommended'
import reactPlugin from 'eslint-plugin-react'
import tseslint from 'typescript-eslint'
import globals from './globals.json' assert { type: 'json' }

/**
 * @param {{tsconfigPath?: string}|undefined} params
 */
export function genConfigs(params) {
  const tsconfigPath = params?.tsconfigPath ?? './tsconfig.json'

  const configs = [
    {
      ignores: [
        '.DS_Store',
        '**/*.hbs',
        '**/.husky/',
        '**/.nx/',
        '**/.git/',
        '**/.yarn/',
        '**/__test__/fixtures/',
        '**/coverage/',
        '**/dist/',
        '**/lib/',
        '**/node_modules/',
      ],
    },
    eslint.configs.recommended,
    prettierPlugin,
    importPlugin.flatConfigs.errors,
    importPlugin.flatConfigs.warnings,
    {
      files: ['**/*.{mjs,ts,mts}'],
      languageOptions: {
        parserOptions: {
          ecmaVersion: 2018,
          sourceType: 'module',
          ecmaFeatures: {
            globalReturn: false,
            impliedStrict: true,
          },
        },
        globals: { ...globals.builtin, ...globals.node },
      },
    },
    {
      files: ['**/*.{js,cjs,cts}'],
      languageOptions: {
        parserOptions: {
          ecmaVersion: 2018,
          sourceType: 'commonjs',
          ecmaFeatures: {
            globalReturn: false,
            impliedStrict: true,
          },
        },
        globals: { ...globals.builtin, ...globals.node },
      },
    },
    {
      files: ['**/*.{jsx,tsx,mjsx,mtsx}'],
      languageOptions: {
        parserOptions: {
          ecmaVersion: 2018,
          sourceType: 'module',
          ecmaFeatures: {
            globalReturn: false,
            impliedStrict: true,
          },
        },
        globals: { ...globals.builtin, ...globals.browser, ...globals.node },
      },
    },
    {
      rules: {
        'array-callback-return': 'warn',
        'class-methods-use-this': 'off',
        'default-case': ['warn', { commentPattern: '^no default$' }],
        'dot-location': ['warn', 'property'],
        eqeqeq: ['warn', 'smart'],
        'func-call-spacing': ['error', 'never'],
        'func-names': 'off',
        'getter-return': 'warn',
        'key-spacing': 'error',
        'lines-between-class-members': 'off',
        'max-len': [
          'error',
          {
            code: 100,
            comments: 100,
            tabWidth: 2,
            ignorePattern:
              '(?:^\\s*\\*\\s*@\\w+)|(?:^\\s*\\/\\/\\s*eslint-disable-next-line\\s)|(?:^\\s*\\/\\/)',
            ignoreTrailingComments: true,
            ignoreUrls: true,
            ignoreStrings: true,
            ignoreTemplateLiterals: true,
            ignoreRegExpLiterals: true,
          },
        ],
        'new-cap': ['error', { newIsCap: true, capIsNew: true }],
        'new-parens': 'warn',
        'no-array-constructor': 'warn',
        'no-await-in-loop': 'off',
        'no-bitwise': 'off',
        'no-caller': 'warn',
        'no-cond-assign': ['error', 'always'],
        'no-console': 'off',
        'no-const-assign': 'warn',
        'no-continue': 'off',
        'no-control-regex': 'warn',
        'no-delete-var': 'warn',
        'no-dupe-args': 'warn',
        'no-dupe-class-members': 'warn',
        'no-dupe-keys': 'warn',
        'no-duplicate-case': 'warn',
        'no-empty-character-class': 'warn',
        'no-empty-pattern': 'warn',
        'no-eval': 'warn',
        'no-ex-assign': 'warn',
        'no-extend-native': 'warn',
        'no-extra-bind': 'warn',
        'no-extra-label': 'warn',
        'no-fallthrough': 'warn',
        'no-func-assign': 'warn',
        'no-inner-declarations': 'error',
        'no-implied-eval': 'warn',
        'no-invalid-regexp': 'warn',
        'no-iterator': 'warn',
        'no-label-var': 'warn',
        'no-labels': ['warn', { allowLoop: true, allowSwitch: false }],
        'no-lone-blocks': 'off',
        'no-loop-func': 'warn',
        'no-mixed-operators': [
          'warn',
          {
            groups: [
              ['&', '|', '^', '~', '<<', '>>', '>>>'],
              ['==', '!=', '===', '!==', '>', '>=', '<', '<='],
              ['&&', '||'],
              ['in', 'instanceof'],
            ],
            allowSamePrecedence: false,
          },
        ],
        'no-mixed-spaces-and-tabs': 'error',
        'no-multi-spaces': ['error', { ignoreEOLComments: true }],
        'no-multi-str': 'warn',
        'no-native-reassign': 'warn',
        'no-negated-in-lhs': 'warn',
        'no-new-func': 'warn',
        'no-new-object': 'warn',
        'no-new-symbol': 'warn',
        'no-new-wrappers': 'warn',
        'no-obj-calls': 'warn',
        'no-octal': 'warn',
        'no-octal-escape': 'warn',
        'no-param-reassign': ['error', { props: true }],
        'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
        'no-prototype-builtins': 'warn',
        'no-redeclare': 'warn',
        'no-regex-spaces': 'warn',
        'no-restricted-globals': [
          'error',
          'event',
          'length',
          'location',
          'name',
          'open',
          'parent',
          'print',
          'screen',
          'self',
        ],
        'no-restricted-properties': [
          'error',
          {
            object: 'require',
            property: 'ensure',
            message:
              'Please use import() instead. More info: https://facebook.github.io/create-react-app/docs/code-splitting',
          },
          {
            object: 'System',
            property: 'import',
            message:
              'Please use import() instead. More info: https://facebook.github.io/create-react-app/docs/code-splitting',
          },
        ],
        'no-restricted-syntax': ['warn', 'WithStatement'],
        'no-return-assign': ['error', 'always'],
        'no-script-url': 'warn',
        'no-self-assign': 'warn',
        'no-self-compare': 'warn',
        'no-sequences': 'warn',
        'no-shadow-restricted-names': 'warn',
        'no-sparse-arrays': 'warn',
        'no-template-curly-in-string': 'warn',
        'no-this-before-super': 'warn',
        'no-throw-literal': 'warn',
        'no-undef': 'error',
        'no-underscore-dangle': 'off',
        'no-unreachable': 'warn',
        'no-unused-expressions': [
          'error',
          {
            allowShortCircuit: true,
            allowTernary: true,
            allowTaggedTemplates: true,
          },
        ],
        'no-unused-labels': 'warn',
        'no-unused-vars': [
          'warn',
          {
            args: 'none',
            ignoreRestSiblings: true,
          },
        ],
        'no-use-before-define': ['warn', { functions: false, classes: false, variables: false }],
        'no-useless-computed-key': 'warn',
        'no-useless-concat': 'warn',
        'no-useless-constructor': 'warn',
        'no-useless-escape': 'warn',
        'no-useless-rename': [
          'warn',
          {
            ignoreDestructuring: false,
            ignoreImport: false,
            ignoreExport: false,
          },
        ],
        'no-whitespace-before-property': 'warn',
        'no-with': 'warn',
        'prefer-destructuring': 'off',
        quotes: ['error', 'single', { avoidEscape: true }],
        'require-yield': 'warn',
        'rest-spread-spacing': ['warn', 'never'],
        semi: ['error', 'never'],
        'sort-imports': [
          'error',
          {
            ignoreCase: false,
            ignoreDeclarationSort: true,
            ignoreMemberSort: false,
          },
        ],
        'space-before-blocks': [
          'error',
          {
            functions: 'always',
            keywords: 'always',
            classes: 'always',
          },
        ],
        'space-before-function-paren': 'off',
        'spaced-comment': ['error', 'always'],
        'space-in-parens': 'off',
        'space-infix-ops': ['error', { int32Hint: false }],
        'space-unary-ops': ['error', { words: true, nonwords: false }],
        strict: ['warn', 'never'],
        'unicode-bom': ['warn', 'never'],
        'use-isnan': 'warn',
        'valid-typeof': 'warn',
      },
    },
    ...tseslint.config(...tseslint.configs.recommended, ...tseslint.configs.strict, {
      files: ['**/*.{ts,cts,mts,tsx,ctsx,mtsx}'],
      languageOptions: {
        parserOptions: {
          ecmaFeatures: {
            jsx: true,
          },
          project: tsconfigPath,
          sourceType: 'module',
          warnOnUnsupportedTypeScriptVersion: true,
          allowImportExportEverywhere: true,
        },
      },
      rules: {
        'default-case': 'off',
        'no-array-constructor': 'off',
        'no-dupe-class-members': 'off',
        'no-redeclare': 'off',
        'no-undef': 'off',
        'no-unused-expressions': 'off',
        'no-unused-vars': 'off',
        'no-use-before-define': 'off',
        'no-useless-constructor': 'off',
        '@typescript-eslint/array-type': [
          'error',
          {
            default: 'array-simple',
            readonly: 'generic',
          },
        ],
        '@typescript-eslint/class-literal-property-style': ['error', 'fields'],
        '@typescript-eslint/consistent-indexed-object-style': ['error', 'record'],
        '@typescript-eslint/consistent-type-assertions': [
          'error',
          {
            assertionStyle: 'as',
            objectLiteralTypeAssertions: 'allow-as-parameter',
          },
        ],
        '@typescript-eslint/consistent-type-definitions': ['warn', 'interface'],
        '@typescript-eslint/consistent-type-imports': [
          'error',
          {
            prefer: 'type-imports',
            disallowTypeAnnotations: true,
          },
        ],
        '@typescript-eslint/explicit-function-return-type': [
          'error',
          {
            allowExpressions: true,
            allowTypedFunctionExpressions: true,
            allowHigherOrderFunctions: false,
            allowDirectConstAssertionInArrowFunctions: true,
            allowConciseArrowFunctionExpressionsStartingWithVoid: true,
            allowedNames: ['useStyles'],
          },
        ],
        '@typescript-eslint/explicit-member-accessibility': [
          'error',
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
        '@typescript-eslint/method-signature-style': 'off',
        '@typescript-eslint/no-array-constructor': 'warn',
        '@typescript-eslint/no-confusing-non-null-assertion': 'error',
        '@typescript-eslint/no-confusing-void-expression': [
          'error',
          {
            ignoreArrowShorthand: true,
            ignoreVoidOperator: true,
          },
        ],
        '@typescript-eslint/no-dynamic-delete': 'error',
        '@typescript-eslint/no-empty-function': 'off',
        '@typescript-eslint/no-empty-interface': ['error', { allowSingleExtends: true }],
        '@typescript-eslint/no-empty-object-type': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-floating-promises': 'error',
        '@typescript-eslint/no-invalid-void-type': 'off',
        '@typescript-eslint/no-misused-promises': [
          'error',
          {
            checksConditionals: true,
            checksVoidReturn: true,
          },
        ],
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/no-redeclare': [
          'warn',
          {
            ignoreDeclarationMerge: true,
          },
        ],
        '@typescript-eslint/no-this-alias': [
          'error',
          {
            allowDestructuring: true,
            allowedNames: ['self'],
          },
        ],
        '@typescript-eslint/no-use-before-define': [
          'warn',
          {
            functions: false,
            classes: false,
            variables: false,
            typedefs: false,
          },
        ],
        '@typescript-eslint/no-unnecessary-qualifier': 'error',
        '@typescript-eslint/no-unnecessary-type-arguments': 'error',
        '@typescript-eslint/no-unused-expressions': [
          'error',
          {
            allowShortCircuit: true,
            allowTernary: true,
            allowTaggedTemplates: true,
          },
        ],
        '@typescript-eslint/no-unused-vars': [
          'warn',
          {
            args: 'all',
            argsIgnorePattern: '^_',
            caughtErrors: 'all',
            caughtErrorsIgnorePattern: '^_',
            destructuredArrayIgnorePattern: '^_',
            varsIgnorePattern: '^_',
            ignoreRestSiblings: true,
          },
        ],
        '@typescript-eslint/no-useless-constructor': 'warn',
        '@typescript-eslint/prefer-as-const': 'error',
        '@typescript-eslint/prefer-enum-initializers': 'error',
        '@typescript-eslint/unified-signatures': 'error',
      },
    }),
    {
      rules: {
        'import/default': 'off',
        'import/export': 'off',
        'import/extensions': 'off',
        'import/first': 'error',
        'import/named': 'off',
        'import/namespace': 'off',
        'import/no-anonymous-default-export': 'off',
        'import/no-cycle': ['error', { ignoreExternal: true }],
        'import/no-deprecated': 'off',
        'import/no-extraneous-dependencies': 'error',
        'import/no-named-as-default': 'off',
        'import/no-named-as-default-member': 'off',
        'import/no-named-default': 'off',
        'import/no-self-import': 'error',
        'import/no-useless-path-segments': 'off',
        'import/no-unresolved': 'off',
        'import/no-webpack-loader-syntax': 'error',
        'import/order': [
          'error',
          {
            alphabetize: { order: 'asc', caseInsensitive: true },
            groups: [['builtin', 'external'], 'internal', 'parent', 'sibling'],
            pathGroups: [{ pattern: '@*/**', group: 'internal', position: 'after' }],
            'newlines-between': 'never',
          },
        ],
        'import/prefer-default-export': 'off',
      },
    },
    {
      files: ['**/*.{jsx,tsx}'],
      plugins: {
        'jsx-a11y': jsxA11yPlugin,
      },
      rules: {
        'jsx-a11y/alt-text': 'warn',
        'jsx-a11y/anchor-has-content': 'warn',
        'jsx-a11y/anchor-is-valid': [
          'warn',
          {
            aspects: ['noHref', 'invalidHref'],
          },
        ],
        'jsx-a11y/aria-activedescendant-has-tabindex': 'warn',
        'jsx-a11y/aria-props': 'warn',
        'jsx-a11y/aria-proptypes': 'warn',
        'jsx-a11y/aria-role': ['warn', { ignoreNonDOM: true }],
        'jsx-a11y/aria-unsupported-elements': 'warn',
        'jsx-a11y/heading-has-content': 'warn',
        'jsx-a11y/iframe-has-title': 'warn',
        'jsx-a11y/img-redundant-alt': 'warn',
        'jsx-a11y/no-access-key': 'warn',
        'jsx-a11y/no-distracting-elements': 'warn',
        'jsx-a11y/no-redundant-roles': 'warn',
        'jsx-a11y/role-has-required-aria-props': 'warn',
        'jsx-a11y/role-supports-aria-props': 'warn',
        'jsx-a11y/scope': 'warn',
      },
    },
    {
      files: ['**/*.{jsx,cjsx,mjsx,tsx,ctsx,mtsx}'],
      plugins: { react: reactPlugin },
      languageOptions: {
        parserOptions: {
          ecmaVersion: 2018,
          sourceType: 'module',
          ecmaFeatures: {
            globalReturn: false,
            impliedStrict: true,
            jsx: true,
          },
        },
        globals: {
          ...globals.browser,
        },
      },
      rules: {
        'react/display-name': 'error',
        'react/forbid-foreign-prop-types': ['warn', { allowInPropTypes: true }],
        'react/jsx-boolean-value': ['error', 'always'],
        'react/jsx-closing-bracket-location': [
          'error',
          {
            nonEmpty: 'tag-aligned',
            selfClosing: 'line-aligned',
          },
        ],
        'react/jsx-curly-newline': [
          'error',
          {
            multiline: 'consistent',
            singleline: 'consistent',
          },
        ],
        'react/jsx-curly-spacing': [
          'error',
          {
            when: 'always',
            children: true,
            allowMultiline: true,
            spacing: { objectLiterals: 'never' },
          },
        ],
        'react/jsx-equals-spacing': ['error', 'never'],
        'react/jsx-filename-extension': [
          'error',
          {
            extensions: ['.jsx', '.tsx', '.js', '.ts'],
          },
        ],
        'react/jsx-first-prop-new-line': ['error', 'multiline-multiprop'],
        'react/jsx-fragments': ['error', 'element'],
        'react/jsx-indent-props': ['error', 2],
        'react/jsx-indent': [
          'error',
          2,
          {
            checkAttributes: true,
            indentLogicalExpressions: true,
          },
        ],
        'react/jsx-max-props-per-line': [
          'error',
          {
            maximum: 1,
            when: 'multiline',
          },
        ],
        'react/jsx-no-bind': [
          'error',
          {
            ignoreDOMComponents: false,
            ignoreRefs: false,
            allowArrowFunctions: true,
            allowFunctions: false,
            allowBind: false,
          },
        ],
        'react/jsx-no-comment-textnodes': 'warn',
        'react/jsx-no-duplicate-props': ['error', { ignoreCase: true }],
        'react/jsx-no-target-blank': 'warn',
        'react/jsx-no-undef': 'error',
        'react/jsx-pascal-case': 'error',
        'react/jsx-props-no-multi-spaces': 'error',
        'react/jsx-tag-spacing': [
          'error',
          {
            closingSlash: 'never',
            beforeSelfClosing: 'always',
            afterOpening: 'never',
            beforeClosing: 'never',
          },
        ],
        'react/jsx-uses-vars': 'warn',
        'react/jsx-uses-react': 'warn',
        'react/jsx-wrap-multilines': [
          'error',
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
        'react/no-danger-with-children': 'warn',
        'react/no-direct-mutation-state': 'warn',
        'react/no-is-mounted': 'warn',
        'react/no-typos': 'error',
        'react/require-render-return': 'error',
        'react/self-closing-comp': 'error',
        'react/style-prop-object': 'warn',
      },
    },
    {
      files: ['**/*.{ts,cts,mts,tsx,ctsx,mtsx}'],
      plugins: {
        '@stylistic/ts': stylisticTsPlugin,
      },
      rules: {
        '@stylistic/ts/member-delimiter-style': [
          'error',
          {
            multiline: {
              delimiter: 'none',
              requireLast: false,
            },
            singleline: {
              delimiter: 'semi',
              requireLast: false,
            },
          },
        ],
        '@stylistic/ts/space-before-function-paren': [
          'error',
          {
            named: 'never',
            anonymous: 'always',
            asyncArrow: 'always',
          },
        ],
        '@stylistic/ts/type-annotation-spacing': [
          'error',
          {
            before: false,
            after: true,
            overrides: {
              arrow: {
                before: true,
                after: true,
              },
            },
          },
        ],
      },
    },
    {
      files: ['**/__test__/**/*.{js,cjs,mjs,jsx,ts,cts,mts,tsx}', 'jest.helper.ts'],
      plugins: {
        jest: jestPlugin,
      },
      languageOptions: {
        parserOptions: {
          ecmaVersion: 2018,
          sourceType: 'module',
          ecmaFeatures: {
            globalReturn: false,
            impliedStrict: true,
          },
        },
        globals: { ...globals.builtin, ...globals.browser, ...globals.node, ...globals.jest },
      },
      rules: {
        '@typescript-eslint/ban-ts-comment': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        'import/no-extraneous-dependencies': 'off',
        'import/no-named-as-default': 'off',
        'jest/expect-expect': 'off',
        'no-plusplus': 'off',
      },
    },
    {
      files: ['**/constant.{ts,cts,mts}', '**/constant/**.{ts,cts,mts}'],
      rules: {
        '@typescript-eslint/prefer-literal-enum-member': 'off',
      },
    },
    {
      files: ['**/demo/**/*.ts'],
      rules: {
        '@typescript-eslint/no-unused-vars': 'off',
        'import/no-extraneous-dependencies': 'off',
      },
    },
    {
      files: ['script/**/*'],
      rules: {
        'import/no-extraneous-dependencies': 'off',
      },
    },
    {
      files: [
        'eslint.config.{js,cjs,mjs}',
        'jest.config.{js,cjs,mjs}',
        'rollup.config.{js,cjs,mjs,ts,cts,mts}',
        'rollup.config.*.{js,cjs,mjs,ts,cts,mts}',
      ],
      rules: {
        'import/no-anonymous-default-export': 'off',
      },
    },
  ]

  return configs
}

export default genConfigs()

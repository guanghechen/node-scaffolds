import eslint from '@eslint/js'
import ghcEslint from '@guanghechen/eslint-config'
import tseslint from 'typescript-eslint'

export default {
  "languageOptions": {
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
      "ecmaVersion": 2018,
      "sourceType": "module",
      "project": "./tsconfig.json",
      "warnOnUnsupportedTypeScriptVersion": true,
      "allowImportExportEverywhere": true
    }
  },
  "rules": {
    ...eslint.configs.recommended,
    ...tseslint.configs.recommended,
    ...ghcEslint.rules,
    "default-case": 0,
    "no-array-constructor": 0,
    "no-dupe-class-members": 0,
    "no-redeclare": 0,
    "no-undef": 0,
    "no-unused-expressions": 0,
    "no-unused-vars": 0,
    "no-use-before-define": 0,
    "no-useless-constructor": 0,
    "@typescript-eslint/array-type": [
      2,
      {
        "default": "array-simple",
        "readonly": "generic"
      }
    ],
    "@typescript-eslint/class-literal-property-style": [2, "fields"],
    "@typescript-eslint/consistent-indexed-object-style": [2, "record"],
    "@typescript-eslint/consistent-type-assertions": [
      2,
      {
        "assertionStyle": "as",
        "objectLiteralTypeAssertions": "allow-as-parameter"
      }
    ],
    "@typescript-eslint/consistent-type-definitions": [1, "interface"],
    "@typescript-eslint/consistent-type-imports": [
      2,
      {
        "prefer": "type-imports",
        "disallowTypeAnnotations": true
      }
    ],
    "@typescript-eslint/explicit-function-return-type": [
      2,
      {
        "allowExpressions": true,
        "allowTypedFunctionExpressions": true,
        "allowHigherOrderFunctions": false,
        "allowDirectConstAssertionInArrowFunctions": true,
        "allowConciseArrowFunctionExpressionsStartingWithVoid": true,
        "allowedNames": ["useStyles"]
      }
    ],
    "@typescript-eslint/explicit-member-accessibility": [
      2,
      {
        "accessibility": "explicit",
        "overrides": {
          "accessors": "explicit",
          "constructors": "no-public",
          "methods": "explicit",
          "properties": "explicit",
          "parameterProperties": "no-public"
        }
      }
    ],
    "@typescript-eslint/member-delimiter-style": [
      2,
      {
        "multiline": {
          "delimiter": "none",
          "requireLast": false
        },
        "singleline": {
          "delimiter": "comma",
          "requireLast": true
        }
      }
    ],
    "@typescript-eslint/method-signature-style": 0,
    "@typescript-eslint/no-array-constructor": 1,
    "@typescript-eslint/no-confusing-non-null-assertion": 2,
    "@typescript-eslint/no-confusing-void-expression": [
      2,
      {
        "ignoreArrowShorthand": true,
        "ignoreVoidOperator": true
      }
    ],
    "@typescript-eslint/no-dynamic-delete": 2,
    "@typescript-eslint/no-empty-function": 0,
    "@typescript-eslint/no-empty-interface": [
      2,
      {
        "allowSingleExtends": true
      }
    ],
    "@typescript-eslint/no-explicit-any": 0,
    "@typescript-eslint/no-floating-promises": 2,
    "@typescript-eslint/no-misused-promises": [
      2,
      {
        "checksConditionals": true,
        "checksVoidReturn": true
      }
    ],
    "@typescript-eslint/no-non-null-assertion": 0,
    "@typescript-eslint/no-redeclare": [
      1,
      {
        "ignoreDeclarationMerge": true
      }
    ],
    "@typescript-eslint/no-this-alias": [
      2,
      {
        "allowDestructuring": true,
        "allowedNames": ["self"]
      }
    ],
    "@typescript-eslint/no-use-before-define": [
      1,
      {
        "functions": false,
        "classes": false,
        "variables": false,
        "typedefs": false
      }
    ],
    "@typescript-eslint/no-unnecessary-qualifier": 2,
    "@typescript-eslint/no-unnecessary-type-arguments": 2,
    "@typescript-eslint/no-unused-expressions": [
      2,
      {
        "allowShortCircuit": true,
        "allowTernary": true,
        "allowTaggedTemplates": true
      }
    ],
    "@typescript-eslint/no-unused-vars": [
      1,
      {
        "args": "none",
        "ignoreRestSiblings": true
      }
    ],
    "@typescript-eslint/no-useless-constructor": 1,
    "@typescript-eslint/prefer-as-const": 2,
    "@typescript-eslint/prefer-enum-initializers": 2,
    "@typescript-eslint/space-before-function-paren": [
      2,
      {
        "named": "never",
        "anonymous": "always",
        "asyncArrow": "always"
      }
    ],
    "@typescript-eslint/type-annotation-spacing": [
      2,
      {
        "before": false,
        "after": true,
        "overrides": {
          "arrow": {
            "before": true,
            "after": true
          }
        }
      }
    ],
    "@typescript-eslint/unified-signatures": 2
  }
}

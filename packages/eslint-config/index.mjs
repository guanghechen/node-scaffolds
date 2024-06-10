import eslint from '@eslint/js'

export default {
  "languageOptions": {
    "parserOptions": {
      "ecmaVersion": 2018,
      "sourceType": "module",
      "ecmaFeatures": {
        "globalReturn": false,
        "impliedStrict": true
      }
    }
  },
  "rules": {
    ...eslint.configs.recommended,
    "class-methods-use-this": 0,
    "func-call-spacing": [2, "never"],
    "func-names": 0,
    "key-spacing": 2,
    "import/default": 0,
    "import/first": 2,
    "import/named": 0,
    "import/namespace": 0,
    "import/newline-after-import": [
      2,
      {
        "count": 1
      }
    ],
    "import/no-cycle": [
      2,
      {
        "ignoreExternal": true
      }
    ],
    "import/no-deprecated": 0,
    "import/no-extraneous-dependencies": 2,
    "import/no-mutable-exports": 1,
    "import/no-named-as-default": 0,
    "import/no-named-as-default-member": 0,
    "import/no-named-default": 0,
    "import/no-self-import": 2,
    "import/no-useless-path-segments": [
      2,
      {
        "noUselessIndex": true
      }
    ],
    "import/no-unresolved": 0,
    "import/order": [
      2,
      {
        "alphabetize": {
          "order": "asc",
          "caseInsensitive": true
        },
        "groups": [["builtin", "external"], "internal", "parent", "sibling"],
        "pathGroups": [
          {
            "pattern": "@*/**",
            "group": "internal",
            "position": "after"
          }
        ],
        "newlines-between": "never"
      }
    ],
    "import/prefer-default-export": 0,
    "lines-between-class-members": 0,
    "max-len": [
      2,
      {
        "code": 80,
        "comments": 100,
        "tabWidth": 2,
        "ignorePattern": "(?:^\\s*\\*\\s*@\\w+)|(?:^\\s*\\/\\/\\s*eslint-disable-next-line\\s)|(?:^\\s*\\/\\/)",
        "ignoreTrailingComments": true,
        "ignoreUrls": true,
        "ignoreStrings": true,
        "ignoreTemplateLiterals": true,
        "ignoreRegExpLiterals": true
      }
    ],
    "new-cap": [
      2,
      {
        "newIsCap": true,
        "capIsNew": true
      }
    ],
    "no-await-in-loop": 0,
    "no-bitwise": 0,
    "no-console": 0,
    "no-continue": 0,
    "no-cond-assign": [2, "always"],
    "no-inner-declarations": 2,
    "no-lone-blocks": 0,
    "no-mixed-operators": 0,
    "no-mixed-spaces-and-tabs": 2,
    "no-multi-spaces": [
      2,
      {
        "ignoreEOLComments": true
      }
    ],
    "no-param-reassign": [
      2,
      {
        "props": true
      }
    ],
    "no-plusplus": [
      2,
      {
        "allowForLoopAfterthoughts": true
      }
    ],
    "no-prototype-builtins": 1,
    "no-restricted-syntax": 0,
    "no-return-assign": [2, "always"],
    "no-throw-literal": 0,
    "no-underscore-dangle": 0,
    "no-useless-concat": 0,
    "prefer-destructuring": 0,
    "quotes": [2, "single"],
    "semi": [2, "never"],
    "sort-imports": [
      2,
      {
        "ignoreCase": false,
        "ignoreDeclarationSort": true,
        "ignoreMemberSort": false
      }
    ],
    "space-before-blocks": [
      2,
      {
        "functions": "always",
        "keywords": "always",
        "classes": "always"
      }
    ],
    "space-before-function-paren": 0,
    "spaced-comment": [2, "always"],
    "space-in-parens": [2, "never"],
    "space-infix-ops": [
      2,
      {
        "int32Hint": false
      }
    ],
    "space-unary-ops": [
      2,
      {
        "words": true,
        "nonwords": false
      }
    ]
  }
}

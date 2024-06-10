export default {
  "extends": ["@guanghechen", "plugin:react/recommended"],
  "plugins": ["import", "jsx-a11y", "react", "react-hooks"],
  "languageOptions": {
    "parser": "@babel/eslint-parser",
    "parserOptions": {
      "ecmaVersion": 2018,
      "sourceType": "module",
      "ecmaFeatures": {
        "globalReturn": false,
        "impliedStrict": true,
        "jsx": true
      },
      "requireConfigFile": false,
      "allowImportExportEverywhere": true,
      "babelOptions": {
        "plugins": ["@babel/plugin-syntax-import-assertions"]
      }
    },
  },
  "settings": {
    "react": {
      "version": "detect"
    }
  },
  "rules": {
    "array-callback-return": "warn",
    "default-case": [
      "warn",
      {
        "commentPattern": "^no default$"
      }
    ],
    "dot-location": ["warn", "property"],
    "eqeqeq": ["warn", "smart"],
    "new-parens": "warn",
    "no-array-constructor": "warn",
    "no-caller": "warn",
    "no-cond-assign": ["warn", "except-parens"],
    "no-const-assign": "warn",
    "no-control-regex": "warn",
    "no-delete-var": "warn",
    "no-dupe-args": "warn",
    "no-dupe-class-members": "warn",
    "no-dupe-keys": "warn",
    "no-duplicate-case": "warn",
    "no-empty-character-class": "warn",
    "no-empty-pattern": "warn",
    "no-eval": "warn",
    "no-ex-assign": "warn",
    "no-extend-native": "warn",
    "no-extra-bind": "warn",
    "no-extra-label": "warn",
    "no-fallthrough": "warn",
    "no-func-assign": "warn",
    "no-implied-eval": "warn",
    "no-invalid-regexp": "warn",
    "no-iterator": "warn",
    "no-label-var": "warn",
    "no-labels": [
      "warn",
      {
        "allowLoop": true,
        "allowSwitch": false
      }
    ],
    "no-lone-blocks": "warn",
    "no-loop-func": "warn",
    "no-mixed-operators": [
      "warn",
      {
        "groups": [
          ["&", "|", "^", "~", "<<", ">>", ">>>"],
          ["==", "!=", "===", "!==", ">", ">=", "<", "<="],
          ["&&", "||"],
          ["in", "instanceof"]
        ],
        "allowSamePrecedence": false
      }
    ],
    "no-multi-str": "warn",
    "no-native-reassign": "warn",
    "no-negated-in-lhs": "warn",
    "no-new-func": "warn",
    "no-new-object": "warn",
    "no-new-symbol": "warn",
    "no-new-wrappers": "warn",
    "no-obj-calls": "warn",
    "no-octal": "warn",
    "no-octal-escape": "warn",
    "no-redeclare": "warn",
    "no-regex-spaces": "warn",
    "no-restricted-syntax": ["warn", "WithStatement"],
    "no-script-url": "warn",
    "no-self-assign": "warn",
    "no-self-compare": "warn",
    "no-sequences": "warn",
    "no-shadow-restricted-names": "warn",
    "no-sparse-arrays": "warn",
    "no-template-curly-in-string": "warn",
    "no-this-before-super": "warn",
    "no-throw-literal": "warn",
    "no-undef": "error",
    "no-restricted-globals": [
      "error",
      "addEventListener",
      "blur",
      "close",
      "closed",
      "confirm",
      "defaultStatus",
      "defaultstatus",
      "event",
      "external",
      "find",
      "focus",
      "frameElement",
      "frames",
      "history",
      "innerHeight",
      "innerWidth",
      "length",
      "location",
      "locationbar",
      "menubar",
      "moveBy",
      "moveTo",
      "name",
      "onblur",
      "onerror",
      "onfocus",
      "onload",
      "onresize",
      "onunload",
      "open",
      "opener",
      "opera",
      "outerHeight",
      "outerWidth",
      "pageXOffset",
      "pageYOffset",
      "parent",
      "print",
      "removeEventListener",
      "resizeBy",
      "resizeTo",
      "screen",
      "screenLeft",
      "screenTop",
      "screenX",
      "screenY",
      "scroll",
      "scrollbars",
      "scrollBy",
      "scrollTo",
      "scrollX",
      "scrollY",
      "self",
      "status",
      "statusbar",
      "stop",
      "toolbar",
      "top"
    ],
    "no-unreachable": "warn",
    "no-unused-expressions": [
      "error",
      {
        "allowShortCircuit": true,
        "allowTernary": true,
        "allowTaggedTemplates": true
      }
    ],
    "no-unused-labels": "warn",
    "no-unused-vars": [
      "warn",
      {
        "args": "none",
        "ignoreRestSiblings": true
      }
    ],
    "no-use-before-define": [
      "warn",
      {
        "functions": false,
        "classes": false,
        "variables": false
      }
    ],
    "no-useless-computed-key": "warn",
    "no-useless-concat": "warn",
    "no-useless-constructor": "warn",
    "no-useless-escape": "warn",
    "no-useless-rename": [
      "warn",
      {
        "ignoreDestructuring": false,
        "ignoreImport": false,
        "ignoreExport": false
      }
    ],
    "no-with": "warn",
    "no-whitespace-before-property": "warn",
    "react-hooks/exhaustive-deps": "warn",
    "require-yield": "warn",
    "rest-spread-spacing": ["warn", "never"],
    "strict": ["warn", "never"],
    "unicode-bom": ["warn", "never"],
    "use-isnan": "warn",
    "valid-typeof": "warn",
    "no-restricted-properties": [
      "error",
      {
        "object": "require",
        "property": "ensure",
        "message": "Please use import() instead. More info: https://facebook.github.io/create-react-app/docs/code-splitting"
      },
      {
        "object": "System",
        "property": "import",
        "message": "Please use import() instead. More info: https://facebook.github.io/create-react-app/docs/code-splitting"
      }
    ],
    "getter-return": "warn",
    "import/first": "error",
    "import/no-amd": "error",
    "import/no-anonymous-default-export": "warn",
    "import/no-webpack-loader-syntax": "error",
    "react/display-name": 2,
    "react/forbid-foreign-prop-types": [
      "warn",
      {
        "allowInPropTypes": true
      }
    ],
    "react/jsx-boolean-value": [2, "always"],
    "react/jsx-closing-bracket-location": [
      2,
      {
        "nonEmpty": "tag-aligned",
        "selfClosing": "line-aligned"
      }
    ],
    "react/jsx-curly-newline": [
      2,
      {
        "multiline": "consistent",
        "singleline": "consistent"
      }
    ],
    "react/jsx-curly-spacing": [
      2,
      {
        "when": "always",
        "children": true,
        "allowMultiline": true,
        "spacing": {
          "objectLiterals": "never"
        }
      }
    ],
    "react/jsx-equals-spacing": [2, "never"],
    "react/jsx-filename-extension": [
      2,
      {
        "extensions": [".jsx", ".tsx", ".js", ".ts"]
      }
    ],
    "react/jsx-first-prop-new-line": [2, "multiline-multiprop"],
    "react/jsx-fragments": [2, "element"],
    "react/jsx-indent-props": [2, 2],
    "react/jsx-indent": [
      2,
      2,
      {
        "checkAttributes": true,
        "indentLogicalExpressions": true
      }
    ],
    "react/jsx-max-props-per-line": [
      2,
      {
        "maximum": 1,
        "when": "multiline"
      }
    ],
    "react/jsx-no-bind": [
      2,
      {
        "ignoreDOMComponents": false,
        "ignoreRefs": false,
        "allowArrowFunctions": true,
        "allowFunctions": false,
        "allowBind": false
      }
    ],
    "react/jsx-no-comment-textnodes": "warn",
    "react/jsx-no-duplicate-props": [2, { "ignoreCase": true }],
    "react/jsx-no-target-blank": "warn",
    "react/jsx-no-undef": "error",
    "react/jsx-pascal-case": 2,
    "react/jsx-props-no-multi-spaces": 2,
    "react/jsx-tag-spacing": [
      2,
      {
        "closingSlash": "never",
        "beforeSelfClosing": "always",
        "afterOpening": "never",
        "beforeClosing": "never"
      }
    ],
    "react/jsx-uses-vars": 1,
    "react/jsx-uses-react": 1,
    "react/jsx-wrap-multilines": [
      2,
      {
        "declaration": "parens-new-line",
        "assignment": "parens-new-line",
        "return": "parens-new-line",
        "arrow": "parens-new-line",
        "condition": "parens",
        "logical": "parens",
        "prop": "ignore"
      }
    ],
    "react/no-danger-with-children": "warn",
    "react/no-direct-mutation-state": "warn",
    "react/no-is-mounted": "warn",
    "react/no-typos": "error",
    "react/require-render-return": "error",
    "react/self-closing-comp": 2,
    "react/style-prop-object": "warn",
    "jsx-a11y/alt-text": "warn",
    "jsx-a11y/anchor-has-content": "warn",
    "jsx-a11y/anchor-is-valid": [
      "warn",
      {
        "aspects": ["noHref", "invalidHref"]
      }
    ],
    "jsx-a11y/aria-activedescendant-has-tabindex": "warn",
    "jsx-a11y/aria-props": "warn",
    "jsx-a11y/aria-proptypes": "warn",
    "jsx-a11y/aria-role": [
      "warn",
      {
        "ignoreNonDOM": true
      }
    ],
    "jsx-a11y/aria-unsupported-elements": "warn",
    "jsx-a11y/heading-has-content": "warn",
    "jsx-a11y/iframe-has-title": "warn",
    "jsx-a11y/img-redundant-alt": "warn",
    "jsx-a11y/no-access-key": "warn",
    "jsx-a11y/no-distracting-elements": "warn",
    "jsx-a11y/no-redundant-roles": "warn",
    "jsx-a11y/role-has-required-aria-props": "warn",
    "jsx-a11y/role-supports-aria-props": "warn",
    "jsx-a11y/scope": "warn",
    "react-hooks/rules-of-hooks": "error"
  }
}


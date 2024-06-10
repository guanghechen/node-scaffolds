import eslintConfig from "@guanghechen/eslint-config"
import eslintConfigJsx from "@guanghechen/eslint-config-jsx"
import eslintConfigTs from "@guanghechen/eslint-config-ts"
import tsParser from "@typescript-eslint/parser"

export default [
  {
    ignores: [
      ".git/",
      ".github/",
      ".husky/",
      ".yarn",
      "**/coverage/",
      "**/dist/",
      "**/doc/",
      "**/lib/",
      "**/node_modules/",
      "**/public/",
    ]
  },
  {
    "files": ["**/*.js"],
    // "extends": ["@guanghechen", "prettier"]

  },
  {
    "files": ["**/*.mjs"],
    languageOptions: {
      parser: tsParser,
    },
    // "extends": ["@guanghechen", "prettier"],
  },
  {
    "files": ["**/*.ts", "**/*.mts"],
    languageOptions: {
      parser: tsParser,
    },
    // "extends": ["@guanghechen", "@guanghechen/ts", "prettier"]
  },
  {
    "files": ["**/demo/**/*.ts"],
    languageOptions: {
      parser: tsParser,
    },
    "rules": {
      "import/no-extraneous-dependencies": 0
    },
    // "extends": ["@guanghechen", "@guanghechen/ts", "prettier"],
  },
  {
    "files": ["**/__test__/*.ts", "jest.helper.ts"],
    "rules": {
      "import/no-extraneous-dependencies": 0,
      "jest/expect-expect": 0
    },
    // "extends": ["@guanghechen", "@guanghechen/ts", "plugin:jest/recommended", "prettier"],
  }
]

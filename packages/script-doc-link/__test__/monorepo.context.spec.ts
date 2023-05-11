import { workspaceRootDir } from 'jest.helper'
import { MonorepoContext } from '../src'

describe('MonorepoContext', () => {
  let context: MonorepoContext
  beforeAll(async () => {
    context = await MonorepoContext.scanAndBuild(workspaceRootDir)
  })

  it('should create a MonorepoContext object with the correct properties', async () => {
    // Verify that the context object was created with the correct properties
    expect(context.username).toEqual('guanghechen')
    expect(context.repository).toEqual('node-scaffolds')
    expect(context.rootDir).toEqual(workspaceRootDir)
    expect(context.isVersionIndependent).toEqual(true)
    expect(context.packagePaths).toMatchInlineSnapshot(`
      [
        "packages/chalk-logger",
        "packages/conventional-changelog",
        "packages/eslint-config",
        "packages/eslint-config-jsx",
        "packages/eslint-config-ts",
        "packages/event-bus",
        "packages/helper-buffer",
        "packages/helper-cipher",
        "packages/helper-cipher-file",
        "packages/helper-commander",
        "packages/helper-config",
        "packages/helper-file",
        "packages/helper-fs",
        "packages/helper-func",
        "packages/helper-git",
        "packages/helper-git-cipher",
        "packages/helper-is",
        "packages/helper-jest",
        "packages/helper-mac",
        "packages/helper-npm",
        "packages/helper-option",
        "packages/helper-path",
        "packages/helper-plop",
        "packages/helper-storage",
        "packages/helper-stream",
        "packages/helper-string",
        "packages/invariant",
        "packages/jest-config",
        "packages/mini-copy",
        "packages/observable",
        "packages/postcss-modules-dts",
        "packages/rollup-config",
        "packages/rollup-config-cli",
        "packages/rollup-plugin-copy",
        "packages/script-doc-link",
        "packages/tool-file",
        "packages/tool-git-cipher",
        "packages/tool-mini-copy",
        "packages/utility-types",
        "playground/rollup-plugin-copy",
      ]
    `)
  })
})

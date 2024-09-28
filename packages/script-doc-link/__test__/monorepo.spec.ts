import { isFileSync } from '@guanghechen/fs'
import { workspaceRootDir } from 'jest.helper'
import path from 'node:path'
import type { IMonorepoRewriteAbleItem } from '../src'
import { MonorepoContext, MonorepoDocLinkRewriter, MonorepoDocScanner } from '../src'

describe('context', () => {
  let context: MonorepoContext
  beforeAll(async () => {
    context = await MonorepoContext.scanAndBuild({ rootDir: workspaceRootDir })
  })

  it('basic', async () => {
    // Verify that the context object was created with the correct properties
    expect(context.username).toEqual('guanghechen')
    expect(context.repository).toEqual('node-scaffolds')
    expect(context.rootDir).toEqual(workspaceRootDir)
    expect(context.isVersionIndependent).toEqual(true)
    expect(context.packagePaths).toMatchInlineSnapshot(`
      [
        "packages/tool-mini-copy",
        "packages/tool-file",
        "packages/script-doc-link",
        "packages/rollup-plugin-copy",
        "packages/rollup-config-cli",
        "packages/rollup-config",
        "packages/postcss-modules-dts",
        "packages/mini-copy",
        "packages/jest-config",
        "packages/helper-npm",
        "packages/helper-jest",
        "packages/fs",
        "packages/exec",
        "packages/eslint-config",
        "packages/conventional-changelog",
        "packages/commander",
        "packages/cli",
      ]
    `)
  })

  it('scanner', async () => {
    const scanner = new MonorepoDocScanner({ context })
    const items: IMonorepoRewriteAbleItem[] = await scanner.scan()
    expect(items.length > 0).toEqual(true)
    expect(
      items.every(
        item =>
          path.isAbsolute(item.filepath) &&
          item.filepath.includes(item.packagePath) &&
          isFileSync(item.filepath),
      ),
    ).toEqual(true)
  })
})

describe('rewriter', () => {
  it('independent version', async () => {
    const context = new MonorepoContext({
      rootDir: workspaceRootDir,
      username: 'guanghechen',
      repository: 'node-scaffolds',
      packagePathMap: new Map()
        .set('packages/script-doc-link', {
          name: '@guanghechen/script-doc-link',
          version: '2.0.0',
          private: 'false',
        })
        .set('packages/script-doc-link.types', {
          name: '@guanghechen/script-doc-link.types',
          version: '3.0.0',
          private: 'false',
        })
        .set('packages/chalk-logger', {
          name: '@guanghechen/chalk-logger',
          version: '4.2.3',
          private: 'false',
        }),
      isVersionIndependent: true,
    })
    const rewriter = new MonorepoDocLinkRewriter({ context })

    expect(
      rewriter.rewrite(
        'https://github.com/guanghechen/node-scaffolds/tree/release-6.x.x/packages/script-doc-link#readme' +
          '\n' +
          'https://github.com/guanghechen/node-scaffolds/tree/release-6.x.x/packages/fake-script-doc-link#readme' +
          '\n' +
          '"url": "https://github.com/guanghechen/node-scaffolds/tree/release-6.x.x",' +
          '\n' +
          '"directory": "packages/script-doc-link"',
        'packages/script-doc-link',
      ),
    ).toMatchInlineSnapshot(`
      "https://github.com/guanghechen/node-scaffolds/tree/@guanghechen/script-doc-link@2.0.0/packages/script-doc-link#readme
      https://github.com/guanghechen/node-scaffolds/tree/release-6.x.x/packages/fake-script-doc-link#readme
      "url": "https://github.com/guanghechen/node-scaffolds/tree/@guanghechen/script-doc-link@2.0.0",
      "directory": "packages/script-doc-link""
    `)

    expect(
      rewriter.rewrite(
        'https://github.com/guanghechen/node-scaffolds/tree/release-6.x.x/packages/script-doc-link.types#readme' +
          '\n' +
          'https://github.com/guanghechen/node-scaffolds/tree/release-6.x.x/packages/fake-script-doc-link.types#readme' +
          '\n' +
          '"url": "https://github.com/guanghechen/node-scaffolds/tree/release-6.x.x",' +
          '\n' +
          '"directory": "packages/script-doc-link.types"',
        'packages/script-doc-link.types',
      ),
    ).toMatchInlineSnapshot(`
      "https://github.com/guanghechen/node-scaffolds/tree/@guanghechen/script-doc-link.types@3.0.0/packages/script-doc-link.types#readme
      https://github.com/guanghechen/node-scaffolds/tree/release-6.x.x/packages/fake-script-doc-link.types#readme
      "url": "https://github.com/guanghechen/node-scaffolds/tree/@guanghechen/script-doc-link.types@3.0.0",
      "directory": "packages/script-doc-link.types""
    `)

    expect(
      rewriter.rewrite(
        '[demo1.1.png]: https://raw.githubusercontent.com/guanghechen/node-scaffolds/release-6.x.x/packages/chalk-logger/screenshots/demo1.1.png' +
          '\n' +
          'https://raw.githubusercontent.com/guanghechen/node-scaffolds/release-6.x.x/packages/fake-chalk-logger/screenshots/demo1.1.png' +
          '\n' +
          '"url": "https://github.com/guanghechen/node-scaffolds/tree/release-6.x.x",' +
          '\n' +
          '"directory": "packages/chalk-logger',
        'packages/chalk-logger',
      ),
    ).toMatchInlineSnapshot(`
      "[demo1.1.png]: https://raw.githubusercontent.com/guanghechen/node-scaffolds/@guanghechen/chalk-logger@4.2.3/packages/chalk-logger/screenshots/demo1.1.png
      https://raw.githubusercontent.com/guanghechen/node-scaffolds/release-6.x.x/packages/fake-chalk-logger/screenshots/demo1.1.png
      "url": "https://github.com/guanghechen/node-scaffolds/tree/@guanghechen/chalk-logger@4.2.3",
      "directory": "packages/chalk-logger"
    `)
  })

  it('same version context', async () => {
    const context = new MonorepoContext({
      rootDir: workspaceRootDir,
      username: 'guanghechen',
      repository: 'node-scaffolds',
      packagePathMap: new Map()
        .set('packages/script-doc-link', {
          name: '@guanghechen/script-doc-link',
          version: '2.0.0',
          private: 'false',
        })
        .set('packages/chalk-logger', {
          name: '@guanghechen/chalk-logger',
          version: '2.0.0',
          private: 'false',
        }),
      isVersionIndependent: false,
    })
    const rewriter = new MonorepoDocLinkRewriter({ context })

    expect(
      rewriter.rewrite(
        'https://github.com/guanghechen/node-scaffolds/tree/release-6.x.x/packages/script-doc-link#readme' +
          '\n' +
          'https://github.com/guanghechen/node-scaffolds/tree/release-6.x.x/packages/fake-script-doc-link#readme' +
          '\n' +
          '"url": "https://github.com/guanghechen/node-scaffolds/tree/release-6.x.x",' +
          '\n' +
          '"url": "https://github.com/guanghechen/node-scaffolds/tree/@guanghechen/script-doc-link@5.0.0"' +
          '\n' +
          '"directory": "packages/script-doc-link"',
        'packages/script-doc-link',
      ),
    ).toMatchInlineSnapshot(`
      "https://github.com/guanghechen/node-scaffolds/tree/v2.0.0/packages/script-doc-link#readme
      https://github.com/guanghechen/node-scaffolds/tree/release-6.x.x/packages/fake-script-doc-link#readme
      "url": "https://github.com/guanghechen/node-scaffolds/tree/v2.0.0",
      "url": "https://github.com/guanghechen/node-scaffolds/tree/v2.0.0"
      "directory": "packages/script-doc-link""
    `)

    expect(
      rewriter.rewrite(
        '[demo1.1.png]: https://raw.githubusercontent.com/guanghechen/node-scaffolds/release-6.x.x/packages/chalk-logger/screenshots/demo1.1.png' +
          '\n' +
          'https://raw.githubusercontent.com/guanghechen/node-scaffolds/release-6.x.x/packages/fake-chalk-logger/screenshots/demo1.1.png' +
          '\n' +
          '"url": "https://github.com/guanghechen/node-scaffolds/tree/release-6.x.x",' +
          '\n' +
          '"directory": "packages/chalk-logger',
        'packages/chalk-logger',
      ),
    ).toMatchInlineSnapshot(`
      "[demo1.1.png]: https://raw.githubusercontent.com/guanghechen/node-scaffolds/v2.0.0/packages/chalk-logger/screenshots/demo1.1.png
      https://raw.githubusercontent.com/guanghechen/node-scaffolds/release-6.x.x/packages/fake-chalk-logger/screenshots/demo1.1.png
      "url": "https://github.com/guanghechen/node-scaffolds/tree/v2.0.0",
      "directory": "packages/chalk-logger"
    `)
  })
})

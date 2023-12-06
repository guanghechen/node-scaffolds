// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { chalk } from '@guanghechen/chalk/node'
import { jest } from '@jest/globals'
import { rm, writeFile } from 'jest.helper'
import { existsSync } from 'node:fs'
import fs from 'node:fs/promises'
import path from 'node:path'
import url from 'node:url'
import { rollup, watch } from 'rollup'
import type { IOptions } from '../src'
import copy from '../src'
import { replaceInFile } from './util'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
process.chdir(`${__dirname}/fixtures`)

const encoding = 'utf-8'

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function readFile(filepath: string): Promise<string> {
  return fs.readFile(filepath, encoding)
}

async function build(pluginOptions?: IOptions): Promise<void> {
  await rollup({
    input: 'src/index.js',
    plugins: [copy(pluginOptions)],
  })
}

afterEach(async () => {
  await rm('build')
  await rm('dist')
})

describe('Copy', () => {
  it('No config passed', async () => {
    await build()
    expect(existsSync('dist/asset-1.js')).toBe(false)
  })

  it('Empty array as target', async () => {
    await build({
      targets: [],
    })
    expect(existsSync('dist/asset-1.js')).toBe(false)
  })

  it('Files', async () => {
    await build({
      targets: [
        {
          src: ['src/assets/asset-1.js', 'src/assets/asset-2.js'],
          dest: 'dist',
        },
      ],
    })

    expect(existsSync('dist/asset-1.js')).toBe(true)
    expect(existsSync('dist/asset-2.js')).toBe(true)
  })

  it('Folders', async () => {
    await build({
      targets: [
        {
          src: ['src/assets/css', 'src/assets/scss'],
          dest: 'dist',
        },
      ],
    })

    expect(existsSync('dist/css')).toBe(true)
    expect(existsSync('dist/css/css-1.css')).toBe(true)
    expect(existsSync('dist/css/css-2.css')).toBe(true)
    expect(existsSync('dist/scss')).toBe(true)
    expect(existsSync('dist/scss/scss-1.scss')).toBe(true)
    expect(existsSync('dist/scss/scss-2.scss')).toBe(true)
    expect(existsSync('dist/scss/nested')).toBe(true)
    expect(existsSync('dist/scss/nested/scss-3.scss')).toBe(true)
  })

  it('Glob', async () => {
    await build({
      targets: [
        {
          src: [
            'src/assets/asset-{1,2}.js',
            'src/assets/css/*.css',
            '!**/css-1.css',
            'src/assets/scss/scss-?(1).scss',
          ],
          dest: 'dist',
        },
      ],
    })

    expect(existsSync('dist/asset-1.js')).toBe(true)
    expect(existsSync('dist/asset-2.js')).toBe(true)
    expect(existsSync('dist/css-1.css')).toBe(false)
    expect(existsSync('dist/css-2.css')).toBe(true)
    expect(existsSync('dist/scss-1.scss')).toBe(true)
    expect(existsSync('dist/scss-2.scss')).toBe(false)
  })

  it('Multiple objects as targets', async () => {
    await build({
      targets: [
        { src: ['src/assets/*', 'src/assets/css'], dest: 'dist' },
        { src: 'src/assets/css/*.css', dest: 'build' },
      ],
    })

    expect(existsSync('dist/asset-1.js')).toBe(true)
    expect(existsSync('dist/asset-2.js')).toBe(true)
    expect(existsSync('dist/css')).toBe(true)
    expect(existsSync('dist/css/css-1.css')).toBe(true)
    expect(existsSync('dist/css/css-2.css')).toBe(true)
    expect(existsSync('build/css-1.css')).toBe(true)
    expect(existsSync('build/css-2.css')).toBe(true)
  })

  it('Multiple destinations', async () => {
    await build({
      targets: [
        {
          src: ['src/assets/asset-1.js', 'src/assets/css', 'src/assets/scss/scss-?(1).scss'],
          dest: ['dist', 'build'],
        },
      ],
    })

    expect(existsSync('dist/asset-1.js')).toBe(true)
    expect(existsSync('dist/css')).toBe(true)
    expect(existsSync('dist/css/css-1.css')).toBe(true)
    expect(existsSync('dist/css/css-2.css')).toBe(true)
    expect(existsSync('dist/scss-1.scss')).toBe(true)
    expect(existsSync('build/asset-1.js')).toBe(true)
    expect(existsSync('build/css')).toBe(true)
    expect(existsSync('build/css/css-1.css')).toBe(true)
    expect(existsSync('build/css/css-2.css')).toBe(true)
    expect(existsSync('build/scss-1.scss')).toBe(true)
  })

  it('Same target', async () => {
    await build({
      targets: [
        { src: 'src/assets/css', dest: 'dist' },
        { src: 'src/assets/css', dest: 'dist' },
        {
          src: ['src/assets/asset-1.js', 'src/assets/asset-1.js'],
          dest: 'build',
        },
      ],
    })

    expect(existsSync('dist/css')).toBe(true)
    expect(existsSync('dist/css/css-1.css')).toBe(true)
    expect(existsSync('dist/css/css-2.css')).toBe(true)
    expect(existsSync('build/asset-1.js')).toBe(true)
  })

  it('Throw if target is not an object', async () => {
    await expect(
      build({
        targets: ['src/assets/asset-1.js'] as any,
      }),
    ).rejects.toThrow("'src/assets/asset-1.js' target must be an object")
  })

  test("Throw if target object doesn't have required properties", async () => {
    await expect(
      build({
        targets: [{ src: 'src/assets/asset-1.js' }] as any,
      }),
    ).rejects.toThrow(
      '{ src: \'src/assets/asset-1.js\' } target must have "src" and "dest" properties',
    )
  })

  it('Throw if target object "rename" property is of wrong type', async () => {
    await expect(
      build({
        targets: [{ src: 'src/assets/asset-1.js', dest: 'dist', rename: [] as any }],
      }),
    ).rejects.toThrow(
      "{ src: 'src/assets/asset-1.js', dest: 'dist', rename: [] }" +
        ' target\'s "rename" property must be a string or a function',
    )
  })

  it('Rename target', async () => {
    await build({
      targets: [
        {
          src: 'src/assets/asset-1.js',
          dest: 'dist',
          rename: 'asset-1-renamed.js',
        },
        { src: 'src/assets/css', dest: 'dist', rename: 'css-renamed' },
        {
          src: 'src/assets/css/*',
          dest: 'dist/css-multiple',
          rename: 'css-1.css',
        },
        {
          src: 'src/assets/asset-2.js',
          dest: 'dist',
          rename: (name: string, extension: string) => `${name}-renamed.${extension}`,
        },
        {
          src: 'src/assets/scss',
          dest: 'dist',
          rename: (name: string) => `${name}-renamed`,
        },
        {
          src: 'src/assets/scss/*',
          dest: 'dist/scss-multiple',
          rename: (name: string, extension: string) =>
            extension ? `${name}-renamed.${extension}` : `${name}-renamed`,
        },
        {
          src: 'src/assets/asset-1.js',
          dest: 'dist',
          rename: (_: string, __: string, fullPath: string) =>
            path.basename(fullPath).replace('1', '3'),
        },
      ],
    })

    expect(existsSync('dist/asset-1-renamed.js')).toBe(true)
    expect(existsSync('dist/css-renamed')).toBe(true)
    expect(existsSync('dist/css-renamed/css-1.css')).toBe(true)
    expect(existsSync('dist/css-renamed/css-2.css')).toBe(true)
    expect(existsSync('dist/css-multiple/css-1.css')).toBe(true)
    expect(existsSync('dist/css-multiple/css-2.css')).toBe(false)
    expect(existsSync('dist/asset-2-renamed.js')).toBe(true)
    expect(existsSync('dist/scss-renamed')).toBe(true)
    expect(existsSync('dist/scss-renamed/scss-1.scss')).toBe(true)
    expect(existsSync('dist/scss-renamed/scss-2.scss')).toBe(true)
    expect(existsSync('dist/scss-renamed/nested')).toBe(true)
    expect(existsSync('dist/scss-renamed/nested/scss-3.scss')).toBe(true)
    expect(existsSync('dist/scss-multiple/scss-1-renamed.scss')).toBe(true)
    expect(existsSync('dist/scss-multiple/scss-2-renamed.scss')).toBe(true)
    expect(existsSync('dist/scss-multiple/nested-renamed')).toBe(true)
    expect(existsSync('dist/scss-multiple/nested-renamed/scss-3.scss')).toBe(true)
    expect(existsSync('dist/asset-3.js')).toBe(true)
  })

  it('Throw if transform target is not a file', async () => {
    await expect(
      build({
        targets: [
          {
            src: 'src/assets/css',
            dest: 'dist',
            transform: (contents: string | ArrayBuffer) =>
              contents.toString().replace('blue', 'red'),
          },
        ],
      }),
    ).rejects.toThrow('"transform" option works only on files: \'src/assets/css\' must be a file')
  })

  it('Transform target', async () => {
    await build({
      targets: [
        {
          src: 'src/assets/css/css-1.css',
          dest: ['dist', 'build'],
          transform: (contents: string | ArrayBuffer) => contents.toString().replace('blue', 'red'),
        },
        {
          src: 'src/assets/scss/**/*.scss',
          dest: 'dist',
          transform: (contents: string | ArrayBuffer) =>
            contents.toString().replace('background-color', 'color'),
        },
        {
          src: 'src/assets/css/css-1.css',
          dest: 'dist/css',
          transform: (contents: string | ArrayBuffer, srcPath: string) =>
            contents.toString().replace('blue', path.basename(srcPath).replace('ss-1.css', 'oral')),
        },
      ],
    })

    expect(existsSync('dist/css-1.css')).toBe(true)
    expect(await readFile('dist/css-1.css')).toEqual(expect.stringContaining('red'))
    expect(existsSync('build/css-1.css')).toBe(true)
    expect(await readFile('build/css-1.css')).toEqual(expect.stringContaining('red'))
    expect(existsSync('dist/scss-1.scss')).toBe(true)
    expect(await readFile('dist/scss-1.scss')).toEqual(
      expect.not.stringContaining('background-color'),
    )
    expect(existsSync('dist/scss-2.scss')).toBe(true)
    expect(await readFile('dist/scss-2.scss')).toEqual(
      expect.not.stringContaining('background-color'),
    )
    expect(existsSync('dist/nested/scss-3.scss')).toBe(true)
    expect(await readFile('dist/nested/scss-3.scss')).toEqual(
      expect.not.stringContaining('background-color'),
    )
    expect(existsSync('dist/css/css-1.css')).toBe(true)
    expect(await readFile('dist/css/css-1.css')).toEqual(expect.stringContaining('coral'))
  })
})

describe('Options', () => {
  /* eslint-disable no-console */
  it('Verbose, copy files', async () => {
    console.log = jest.fn()

    await build({
      targets: [
        {
          src: ['src/assets/asset-1.js', 'src/assets/css/*', 'src/assets/scss', 'src/not-exist'],
          dest: 'dist',
        },
      ],
      verbose: true,
    })

    expect(console.log).toHaveBeenCalledTimes(5)
    expect(console.log).toHaveBeenCalledWith(chalk.green('copied:'))
    expect(console.log).toHaveBeenCalledWith(
      chalk.green(`  ${chalk.bold('src/assets/asset-1.js')} → ${chalk.bold('dist/asset-1.js')}`),
    )
    expect(console.log).toHaveBeenCalledWith(
      chalk.green(`  ${chalk.bold('src/assets/css/css-1.css')} → ${chalk.bold('dist/css-1.css')}`),
    )
    expect(console.log).toHaveBeenCalledWith(
      chalk.green(`  ${chalk.bold('src/assets/css/css-2.css')} → ${chalk.bold('dist/css-2.css')}`),
    )
    expect(console.log).toHaveBeenCalledWith(
      chalk.green(`  ${chalk.bold('src/assets/scss')} → ${chalk.bold('dist/scss')}`),
    )
  })

  it('Verbose, no files to copy', async () => {
    console.log = jest.fn()

    await build({
      targets: [{ src: 'src/not-exist', dest: 'dist' }],
      verbose: true,
    })

    expect(console.log).toHaveBeenCalledTimes(1)
    expect(console.log).toHaveBeenCalledWith(chalk.yellow('no items to copy'))
  })

  it('Verbose, rename files', async () => {
    console.log = jest.fn()

    await build({
      targets: [
        {
          src: 'src/assets/asset-1.js',
          dest: 'dist',
          rename: 'asset-1-renamed.js',
        },
        {
          src: 'src/assets/scss/*',
          dest: 'dist/scss-multiple',
          rename: (name: string, extension: string) =>
            extension ? `${name}-renamed.${extension}` : `${name}-renamed`,
        },
      ],
      verbose: true,
    })

    expect(console.log).toHaveBeenCalledTimes(5)
    expect(console.log).toHaveBeenCalledWith(chalk.green('copied:'))
    expect(console.log).toHaveBeenCalledWith(
      `${chalk.green(
        `  ${chalk.bold('src/assets/asset-1.js')} → ${chalk.bold('dist/asset-1-renamed.js')}`,
      )} ${chalk.yellow('[R]')}`,
    )
    expect(console.log).toHaveBeenCalledWith(
      `${chalk.green(
        `  ${chalk.bold('src/assets/scss/scss-1.scss')} → ${chalk.bold(
          'dist/scss-multiple/scss-1-renamed.scss',
        )}`,
      )} ${chalk.yellow('[R]')}`,
    )
    expect(console.log).toHaveBeenCalledWith(
      `${chalk.green(
        `  ${chalk.bold('src/assets/scss/scss-2.scss')} → ${chalk.bold(
          'dist/scss-multiple/scss-2-renamed.scss',
        )}`,
      )} ${chalk.yellow('[R]')}`,
    )
    expect(console.log).toHaveBeenCalledWith(
      `${chalk.green(
        `  ${chalk.bold('src/assets/scss/nested')} → ${chalk.bold(
          'dist/scss-multiple/nested-renamed',
        )}`,
      )} ${chalk.yellow('[R]')}`,
    )
  })

  it('Verbose, transform files', async () => {
    console.log = jest.fn()

    await build({
      targets: [
        {
          src: 'src/assets/css/css-*.css',
          dest: 'dist',
          transform: (contents: string | ArrayBuffer) =>
            contents.toString().replace('background-color', 'color'),
        },
      ],
      verbose: true,
    })

    expect(console.log).toHaveBeenCalledTimes(3)
    expect(console.log).toHaveBeenCalledWith(chalk.green('copied:'))
    expect(console.log).toHaveBeenCalledWith(
      `${chalk.green(
        `  ${chalk.bold('src/assets/css/css-1.css')} → ${chalk.bold('dist/css-1.css')}`,
      )} ${chalk.yellow('[T]')}`,
    )
    expect(console.log).toHaveBeenCalledWith(
      `${chalk.green(
        `  ${chalk.bold('src/assets/css/css-2.css')} → ${chalk.bold('dist/css-2.css')}`,
      )} ${chalk.yellow('[T]')}`,
    )
  })
  /* eslint-enable no-console */

  it('Hook', async () => {
    await build({
      targets: [
        {
          src: ['src/assets/asset-1.js', 'src/assets/css'],
          dest: 'dist',
        },
      ],
      hook: 'buildStart',
    })

    expect(existsSync('dist/asset-1.js')).toBe(true)
    expect(existsSync('dist/css')).toBe(true)
    expect(existsSync('dist/css/css-1.css')).toBe(true)
    expect(existsSync('dist/css/css-2.css')).toBe(true)
  })

  it('Copy once', async () => {
    const watcher = watch({
      input: 'src/index.js',
      output: {
        dir: 'build',
        format: 'esm',
      },
      plugins: [
        copy({
          targets: [{ src: 'src/assets/asset-1.js', dest: 'dist' }],
          copyOnce: true,
        }),
      ],
    })

    await sleep(1000)

    const originalContent = await fs.readFile('src/assets/asset-1.js', encoding)
    expect(await fs.readFile('dist/asset-1.js', encoding)).toEqual(originalContent)

    const newContent = `export const message = "waw"`
    await writeFile('src/assets/asset-1.js', newContent, encoding)
    await sleep(1000)
    expect(await fs.readFile('dist/asset-1.js', encoding)).toEqual(originalContent)

    // Recover src/assets/asset-1.js
    await sleep(1000)
    await writeFile('src/assets/asset-1.js', originalContent, encoding)

    expect(existsSync('dist/asset-1.js')).toBe(true)

    await rm('dist')

    expect(existsSync('dist/asset-1.js')).toBe(false)

    await replaceInFile({
      filepath: 'src/index.js',
      from: 'hey',
      to: 'ho',
      encoding,
    })

    await sleep(1000)

    expect(existsSync('dist/asset-1.js')).toBe(false)

    await watcher.close()

    await replaceInFile({
      filepath: 'src/index.js',
      from: 'ho',
      to: 'hey',
      encoding,
    })
  })

  it('Watch', async () => {
    const transform = (source: string | ArrayBuffer): string =>
      'Author: guanghechen\n' + source.toString()

    const watcher = watch({
      input: 'src/index.js',
      output: {
        dir: 'build',
        format: 'esm',
      },
      plugins: [
        copy({
          targets: [
            {
              src: 'src/assets/asset-1.js',
              dest: 'dist',
              transform,
            },
          ],
          copyOnce: false,
        }),
      ],
    })

    await sleep(1000)
    expect(existsSync('dist/asset-1.js')).toBe(true)

    const originalContent = await fs.readFile('src/assets/asset-1.js', encoding)
    expect(await fs.readFile('dist/asset-1.js', encoding)).toEqual(transform(originalContent))

    const newContent = originalContent + `\nexport const message = "waw";`
    await writeFile('src/assets/asset-1.js', newContent, encoding)
    await sleep(1000)
    expect(await fs.readFile('dist/asset-1.js', encoding)).toEqual(transform(newContent))

    // Recover src/assets/asset-1.js
    await writeFile('src/assets/asset-1.js', originalContent, encoding)
    await sleep(3000)
    expect(await fs.readFile('dist/asset-1.js', encoding)).toEqual(transform(originalContent))

    await rm('dist')
    expect(existsSync('dist/asset-1.js')).toBe(false)

    await replaceInFile({
      filepath: 'src/index.js',
      from: 'hey',
      to: 'ho',
      encoding,
    })

    await sleep(1000)

    expect(existsSync('dist/asset-1.js')).toBe(false)

    await watcher.close()

    await replaceInFile({
      filepath: 'src/index.js',
      from: 'ho',
      to: 'hey',
      encoding,
    })
  }, 10000)

  it('Flatten', async () => {
    await build({
      targets: [
        {
          src: ['src/assets/asset-1.js', 'src/assets/asset-2.js'],
          dest: 'dist',
        },
        {
          src: 'src/**/*.css',
          dest: 'dist',
        },
        {
          src: '**/*.scss',
          dest: 'dist',
          rename: (name: string, extension: string) => `${name}-renamed.${extension}`,
        },
      ],
      flatten: false,
    })

    expect(existsSync('dist/assets/asset-1.js')).toBe(true)
    expect(existsSync('dist/assets/asset-2.js')).toBe(true)
    expect(existsSync('dist/assets/css/css-1.css')).toBe(true)
    expect(existsSync('dist/assets/css/css-2.css')).toBe(true)
    expect(existsSync('dist/assets/scss/scss-1-renamed.scss')).toBe(true)
    expect(existsSync('dist/assets/scss/scss-2-renamed.scss')).toBe(true)
    expect(existsSync('dist/assets/scss/nested/scss-3-renamed.scss')).toBe(true)
  })

  it('Rest options', async () => {
    await build({
      targets: [{ src: 'src/assets/asset-1.js', dest: 'dist' }],
      globbyOptions: {
        ignore: ['**/asset-1.js'],
      },
    })

    expect(existsSync('dist/asset-1.js')).toBe(false)
  })

  it('Rest target options', async () => {
    await build({
      targets: [
        {
          src: 'src/assets/asset-1.js',
          dest: 'dist',
          globbyOptions: {
            ignore: ['**/asset-1.js'],
          },
        },
      ],
    })

    expect(existsSync('dist/asset-1.js')).toBe(false)
  })
})

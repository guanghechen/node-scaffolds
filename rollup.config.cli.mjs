/* eslint-disable import/no-extraneous-dependencies */
import {
  DependencyCategory,
  builtinExternalSet,
  createRollupConfig,
  modify,
  tsPresetConfigBuilder,
} from '@guanghechen/rollup-config'
// import copy from '@guanghechen/rollup-plugin-copy'
import replace from '@rollup/plugin-replace'
import fs from 'node:fs/promises'

const externals = new Set([
  ...builtinExternalSet,
  '@guanghechen/chalk',
  '@guanghechen/chalk/node',
  '@guanghechen/fs',
  '@guanghechen/file-split',
  '@guanghechen/filepart',
  '@guanghechen/invariant',
  '@guanghechen/path',
  '@guanghechen/path.types',
  '@guanghechen/reporter',
  '@guanghechen/reporter.types',
  '@guanghechen/std',
])

export default async function () {
  const manifest = JSON.parse(await fs.readFile('package.json', 'utf8'))
  const configs = [
    await createRollupConfig({
      manifest: {
        source: manifest.source,
        main: manifest.main,
        module: manifest.module,
        types: manifest.types,
      },
      env: { inlineDynamicImports: true },
      presetConfigBuilders: [
        tsPresetConfigBuilder({
          typescriptOptions: {
            tsconfig: 'tsconfig.lib.json',
          },
          additionalPlugins: [
            // copy({
            //   copyOnce: true,
            //   silentIfNoValidTargets: true,
            //   verbose: true,
            //   targets: [
            //     {
            //       src: 'src/boilerplates/',
            //       dest: 'lib/',
            //     },
            //   ],
            // }),
          ],
        }),
      ],
      classifyDependency: id => {
        if (externals.has(id)) return DependencyCategory.EXTERNAL
        return DependencyCategory.UNKNOWN
      },
    }),
  ]

  for (const binPath of Object.values(manifest.bin || {})) {
    const src = binPath.replace(/.\/lib\/esm\/([^/]+)\.mjs/, './src/$1.ts')
    const confs = await createRollupConfig({
      manifest: {
        source: src,
        module: binPath,
      },
      presetConfigBuilders: [
        tsPresetConfigBuilder({
          typescriptOptions: {
            tsconfig: 'tsconfig.lib.json',
          },
          additionalPlugins: [
            replace({
              include: ['src/cli.ts'],
              delimiters: ['', ''],
              preventAssignment: true,
              values: {
                "} from '.';": "} from './index.mjs';",
              },
            }),
            modify(),
          ],
        }),
      ],
      classifyDependency: id => {
        if (id === './index.mjs') return DependencyCategory.EXTERNAL
        if (externals.has(id)) return DependencyCategory.EXTERNAL

        const m = /^([.][\s\S]*|@[^/\s]+[/][^/\s]+|[^/\s]+)/.exec(id)
        if (!!m && externals.has(m[1])) return DependencyCategory.EXTERNAL

        return DependencyCategory.UNKNOWN
      },
    })

    confs.map(conf => {
      if (
        conf.input &&
        conf.output &&
        Array.isArray(conf.input) &&
        conf.input.includes('./src/cli.ts')
      ) {
        // eslint-disable-next-line no-param-reassign
        conf.output.banner = '#! /usr/bin/env node\n'
      }
      return conf
    })

    configs.push(confs)
  }

  return configs.flat().flat().flat()
}

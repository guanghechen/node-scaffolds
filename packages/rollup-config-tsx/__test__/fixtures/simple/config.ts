import path from 'node:path'
import type url from 'postcss-url'
import manifest from './package.json'

export default {
  shouldSourceMap: false,
  preprocessOptions: {
    input: ['src/style/index.styl'],
    pluginOptions: {
      multiEntryOptions: {
        exports: false,
      },
      postcssOptions: {
        modules: {
          localsConvention: 'camelCase',
          generateScopedName: 'ghc-[local]',
        },
        postcssUrlOptions: {
          url: 'inline',
          maxSize: 0.5, // 0.5 KB
          assetsPath: path.join(__dirname, 'lib'),
          fallback: 'copy',
          basePath: [path.join(__dirname, 'src')],
          useHash: false,
        },
      },
    },
  },
  manifest,
  pluginOptions: {
    typescriptOptions: { tsconfig: 'tsconfig.src.json' },
    postcssOptions: {
      extract: 'index.css',
      minimize: false,
      sourceMap: false,
      modules: {
        localsConvention: 'camelCase',
        generateScopedName: 'ghc-[local]',
      },
      postcssUrlOptions: {
        url: 'inline',
        maxSize: 2, // 2 KB
        basePath: [path.join(__dirname, 'src')],
        fallback: function (asset: Parameters<url.CustomTransformFunction>[0]) {
          type Asset = {
            url: string
            originUrl: string
            pathname: string
            absolutePath: string
            relativePath: string
            search: string
            hash: string
          }

          if (/^[/]assets[/]/.test((asset as unknown as Asset).originUrl)) {
            return ('../' + asset.relativePath).replace(/[/\\]+/, '/')
          }
          return asset.url
        },
      },
    },
  },
}

import path from 'path'
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
        maxSize: 0.5, // 0.5 KB
        basePath: [path.join(__dirname, 'src')],
        fallback: function (asset: Parameters<url.CustomTransformFunction>[0]) {
          const url = asset.url.replace(/^[/]assets[/]/, '../assets/')
          return url
        },
      },
    },
  },
}

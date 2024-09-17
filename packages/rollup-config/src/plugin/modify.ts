import type rollup from 'rollup'

interface IModifyPluginOptions {
  modify?(filename: string, code: string): string
}

export function modify(options: IModifyPluginOptions = {}): rollup.Plugin {
  return {
    name: '@guanghechen/rollup-plugin-modify',
    generateBundle: async (_, bundle) => {
      for (const filename in bundle) {
        const item = bundle[filename] as rollup.OutputChunk
        if (item.code) {
          // Customized changes.
          if (options.modify) {
            item.code = options.modify(filename, item.code)
            continue
          }

          if (/\.cjs$/.test(filename)) {
            const modifiedContent: string = item.code.replace(
              /\brequire\s*\(['"]([^'"]+)\.mjs['"]\);?/,
              "require('$1.cjs');",
            )
            item.code = modifiedContent
            continue
          }

          if (/\.mjs$/.test(filename)) {
            const modifiedContent: string = item.code.replace(
              /\s+from\s+['"]([^'"]+)\.cjs['"];?/,
              " from '$1.mjs';",
            )
            item.code = modifiedContent
            continue
          }
        }
      }
    },
  }
}
